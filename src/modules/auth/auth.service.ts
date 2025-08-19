import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient, User, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '../../libs/config/config.service';
import { EmailService } from '../../libs/email/email.service';
import { PrismaService } from '../../libs/prisma/prisma.service';
import {
  AuthCompleteProfileDto,
  AuthCompleteProfileResponse,
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

  private generateTokens(
    userId: string,
    role: UserRole,
    isProfileComplete: boolean = true,
  ): { accessToken: string; refreshToken: string } {
    const accessToken = this.jwt.sign(
      { sub: userId, role, isProfileComplete },
      {
        secret: this.config.jwtSecret,
        expiresIn: this.config.jwtAccessTokenExpiresIn,
      },
    );

    const refreshToken = this.jwt.sign(
      { sub: userId, type: 'refresh_token', isProfileComplete },
      {
        secret: this.config.jwtSecret,
        expiresIn: this.config.jwtRefreshTokenExpiresIn,
      },
    );

    return { accessToken, refreshToken };
  }

  private mapUserToResponse(user: User) {
    return {
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
    };
  }

  private createIncompleteUser(
    email: string,
    tx: Omit<
      PrismaClient,
      '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
    >,
  ): Promise<User> {
    return tx.user.create({
      data: {
        firstName: '',
        lastName: '',
        role: UserRole.student,
        isEmailVerified: false,
        medicalCollegeName: '',
        email,
        phone: null,
        mmbsPassingYear: null,
        password: '', // Will be set during profile completion
      },
    });
  }

  async signup(payload: AuthSignupDto): Promise<AuthSignupResponse> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: payload.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    // Use transaction to ensure both user creation and email sending succeed or fail together
    const user = await this.prisma.$transaction(async (tx) => {
      const newUser = await this.createIncompleteUser(payload.email, tx);

      const token = this.signEmailToken({
        email: newUser.email,
        purpose: 'verify',
      });

      // Send verification email within transaction
      await this.emailService.sendTemplate('verify-email', {
        to: newUser.email,
        email: newUser.email,
        token,
      });

      return newUser;
    });

    const { accessToken, refreshToken } = this.generateTokens(
      user.id,
      user.role,
      false,
    );

    return {
      accessToken,
      refreshToken,
      user: this.mapUserToResponse(user),
      message: 'Verification email sent. Please check your email to continue.',
    };
  }

  async completeProfile(
    payload: AuthCompleteProfileDto,
    userId: string,
  ): Promise<AuthCompleteProfileResponse> {
    if (!userId) {
      throw new BadRequestException('Bad Request');
    }

    const user = await this.prisma.user.findUnique({
      where: { email: payload.email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify the authenticated user owns this email
    if (user.id !== userId) {
      throw new BadRequestException('You can only complete your own profile');
    }

    if (!user.isEmailVerified) {
      throw new BadRequestException(
        'Email must be verified before completing profile',
      );
    }

    // Check if profile is already completed (has password)
    if (user.password && user.password.length > 0) {
      throw new BadRequestException('Profile is already completed');
    }

    const passwordHash = await this.hashPassword(payload.password);

    // Use transaction to ensure both profile update and welcome email sending succeed or fail together
    const updatedUser = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { email: payload.email },
        data: {
          firstName: payload.firstName,
          lastName: payload.lastName,
          role: payload.role || UserRole.student,
          medicalCollegeName: payload.medicalCollegeName,
          phone: payload.phone ?? null,
          mmbsPassingYear:
            payload.mmbsPassingYear !== undefined
              ? String(payload.mmbsPassingYear)
              : null,
          password: passwordHash,
        },
      });

      // Send welcome email within transaction
      await this.emailService.sendTemplate('welcome-email', {
        to: user.email,
        firstName: user.firstName,
      });

      return user;
    });

    const { accessToken, refreshToken } = this.generateTokens(
      updatedUser.id,
      updatedUser.role,
    );

    return {
      accessToken,
      refreshToken,
      user: this.mapUserToResponse(updatedUser),
    };
  }

  async login(payload: AuthLoginDto): Promise<AuthLoginResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: payload.email },
    });

    if (!user) {
      throw new NotFoundException('No user found with this email!');
    }

    // Check if profile is completed
    if (!user.password || user.password.length === 0) {
      // Return special response indicating profile completion needed
      const { accessToken, refreshToken } = this.generateTokens(
        user.id,
        user.role,
        false,
      );

      return {
        accessToken,
        refreshToken,
        user: this.mapUserToResponse(user),
        requiresProfileCompletion: true,
      };
    }

    const isPasswordValid = await this.verifyPassword(
      payload.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { accessToken, refreshToken } = this.generateTokens(
      user.id,
      user.role,
    );

    return {
      accessToken,
      refreshToken,
      user: this.mapUserToResponse(user),
    };
  }

  async verifyEmail(payload: AuthVerifyEmailDto): Promise<{ message: string }> {
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

    await this.prisma.user.update({
      where: { email: payload.email },
      data: { isEmailVerified: true },
    });

    return { message: 'Email verified successfully' };
  }

  async sendForgotPassword(
    payload: AuthSendForgotPasswordDto,
  ): Promise<{ message: string }> {
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

    return { message: 'Recovery password email sent successfully' };
  }

  async resetPassword(
    payload: AuthResetPasswordDto,
  ): Promise<{ message: string }> {
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

    return { message: 'Password reset successful' };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    const payload = await this.jwt.verifyAsync<{
      sub: string;
      type: 'refresh_token';
      isProfileComplete: boolean;
    }>(refreshToken);

    if (payload.type !== 'refresh_token') {
      throw new BadRequestException('Invalid refresh token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const accessToken = await this.jwt.signAsync(
      {
        sub: user.id,
        role: user.role,
        isProfileComplete: user.password && user.password.length > 0,
      },
      {
        secret: this.config.jwtSecret,
        expiresIn: this.config.jwtAccessTokenExpiresIn,
      },
    );

    return { accessToken };
  }
}
