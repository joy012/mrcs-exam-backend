import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { ConfigService } from '../../libs/config/config.service';
import { EmailService } from '../../libs/email/email.service';
import { PrismaService } from '../../libs/prisma/prisma.service';
import {
  AuthLoginDto,
  AuthLoginResponse,
  AuthResetPasswordDto,
  AuthSendForgotPasswordDto,
  AuthSignupDto,
  AuthSignupResponse,
  AuthVerifyEmailDto,
} from './dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  private async hashPassword(plain: string): Promise<string> {
    const salt = await bcrypt.genSalt(this.config.bcryptRounds);
    return bcrypt.hash(plain, salt);
  }

  private signEmailToken(payload: {
    email: string;
    purpose: 'verify' | 'reset';
  }): string {
    return this.jwt.sign(payload, {
      secret: this.config.jwtSecret,
      expiresIn: payload.purpose === 'verify' ? '1d' : '30m',
    });
  }

  async signup(payload: AuthSignupDto): Promise<AuthSignupResponse> {
    const exists = await this.prisma.user.findUnique({
      where: { email: payload.email },
    });
    if (exists) throw new BadRequestException('Email already registered');

    const passwordHash = await this.hashPassword(payload.password);

    const user = await this.prisma.user.create({
      data: {
        firstName: payload.firstName,
        lastName: payload.lastName,
        role: payload.role || UserRole.admin,
        isEmailVerified: false,
        medicalCollegeName: payload.medicalCollegeName,
        email: payload.email,
        phone: payload.phone ?? null,
        mmbsPassingYear:
          payload.mmbsPassingYear !== undefined
            ? String(payload.mmbsPassingYear)
            : null,
        password: passwordHash,
      },
      select: { id: true, email: true },
    });

    const token = this.signEmailToken({ email: user.email, purpose: 'verify' });
    await this.emailService.sendTemplate('verify-email', {
      to: user.email,
      email: user.email,
      token,
    });

    return { userId: user.id };
  }

  async login(payload: AuthLoginDto): Promise<AuthLoginResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: payload.email },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const ok = await bcrypt.compare(payload.password, user.password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    const accessToken = this.jwt.sign(
      { sub: user.id, role: user.role },
      {
        secret: this.config.jwtSecret,
        expiresIn: this.config.jwtAccessTokenExpiresIn,
      },
    );
    return {
      accessToken,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    };
  }

  async verifyEmail(payload: AuthVerifyEmailDto): Promise<void> {
    let decoded: { email: string; purpose: 'verify' | 'reset' };
    try {
      decoded = this.jwt.verify(payload.token, {
        secret: this.config.jwtSecret,
      });
    } catch {
      throw new BadRequestException('Invalid token');
    }
    if (decoded.email !== payload.email || decoded.purpose !== 'verify') {
      throw new BadRequestException('Invalid token');
    }
    const user = await this.prisma.user.update({
      where: { email: payload.email },
      data: { isEmailVerified: true },
    });

    // Send welcome email after successful verification (best-effort)
    try {
      await this.emailService.sendTemplate('welcome-email', {
        to: user.email,
        firstName: user.firstName ?? undefined,
      });
    } catch (err) {
      // Log and continue without failing the verification endpoint
    }
  }

  async sendForgotPassword(payload: AuthSendForgotPasswordDto): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { email: payload.email },
    });
    if (!user) return; // do not reveal existence
    const token = this.signEmailToken({ email: user.email, purpose: 'reset' });
    await this.emailService.sendTemplate('forget-pass-email', {
      to: user.email,
      email: user.email,
      token,
    });
  }

  async resetPassword(payload: AuthResetPasswordDto): Promise<void> {
    let decoded: { email: string; purpose: 'verify' | 'reset' };
    try {
      decoded = this.jwt.verify(payload.token, {
        secret: this.config.jwtSecret,
      });
    } catch {
      throw new BadRequestException('Invalid token');
    }
    if (decoded.email !== payload.email || decoded.purpose !== 'reset') {
      throw new BadRequestException('Invalid token');
    }
    const passwordHash = await this.hashPassword(payload.newPassword);
    await this.prisma.user.update({
      where: { email: payload.email },
      data: { password: passwordHash },
    });
  }
}
