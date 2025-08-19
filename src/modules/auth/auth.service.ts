import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
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

  private async verifyPassword(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }

  private signEmailToken(payload: {
    email: string;
    purpose: 'verify' | 'reset';
  }): string {
    return this.jwt.sign(payload, {
      secret: this.config.jwtSecret,
      expiresIn: '1h',
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
    if (!user) throw new NotFoundException('No user found with this email!');

    const passMatched = await this.verifyPassword(
      payload.password,
      user.password,
    );

    if (!passMatched) throw new UnauthorizedException('Invalid credentials');

    const accessToken = this.jwt.sign(
      { sub: user.id, role: user.role },
      {
        secret: this.config.jwtSecret,
        expiresIn: this.config.jwtAccessTokenExpiresIn,
      },
    );

    const refreshToken = this.jwt.sign(
      { sub: user.id, type: 'refresh_token' },
      {
        secret: this.config.jwtSecret,
        expiresIn: this.config.jwtRefreshTokenExpiresIn,
      },
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        avatarURL: user.avatarURL,
        medicalCollegeName: user.medicalCollegeName,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        mmbsPassingYear: user.mmbsPassingYear,
        phone: user.phone,
        isDeleted: user.isDeleted,
      },
    };
  }

  async verifyEmail(payload: AuthVerifyEmailDto): Promise<string> {
    let decoded: { email: string; purpose: 'verify' | 'reset' };
    try {
      decoded = this.jwt.verify(payload.token, {
        secret: this.config.jwtSecret,
      });
    } catch {
      throw new BadRequestException('Invalid verification token');
    }
    if (decoded.email !== payload.email || decoded.purpose !== 'verify') {
      throw new BadRequestException('Invalid verification token or user email');
    }
    const user = await this.prisma.user.update({
      where: { email: payload.email },
      data: { isEmailVerified: true },
    });

    try {
      await this.emailService.sendTemplate('welcome-email', {
        to: user.email,
        firstName: user.firstName,
      });
    } catch (err) {
      //Log and continue without failing the verification endpoint
      console.log({ err });
    }

    return 'Email verified successfully';
  }

  async sendForgotPassword(
    payload: AuthSendForgotPasswordDto,
  ): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { email: payload.email },
    });
    if (!user) {
      throw new NotFoundException('User with this email does not exist');
    }
    const token = this.signEmailToken({ email: user.email, purpose: 'reset' });
    await this.emailService.sendTemplate('forget-pass-email', {
      to: user.email,
      email: user.email,
      token,
    });

    return 'Recovery password email sent successfully';
  }

  async resetPassword(payload: AuthResetPasswordDto): Promise<string> {
    let decoded: { email: string; purpose: 'verify' | 'reset' };
    try {
      decoded = this.jwt.verify(payload.token, {
        secret: this.config.jwtSecret,
      });
    } catch {
      throw new BadRequestException('Invalid reset password token');
    }

    if (decoded.email !== payload.email || decoded.purpose !== 'reset') {
      throw new BadRequestException('Invalid user email or token');
    }

    const passwordHash = await this.hashPassword(payload.newPassword);

    await this.prisma.user.update({
      where: { email: payload.email },
      data: { password: passwordHash },
    });

    return 'Password reset successful';
  }

  async refreshToken(refreshToken: string): Promise<string> {
    const { id, type } = await this.jwt.verifyAsync<{
      id: string;
      type: 'refresh_token';
    }>(refreshToken);

    if (type !== 'refresh_token')
      throw new BadRequestException('Invalid refresh token');

    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    const accessToken = await this.jwt.signAsync(
      { id: user.id, type: 'access_token' },
      { expiresIn: this.config.jwtAccessTokenExpiresIn },
    );

    return accessToken;
  }
}
