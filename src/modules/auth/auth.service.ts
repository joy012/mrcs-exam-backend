import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { User, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { CustomJwtService } from 'src/libs/jwt/jwt.service';
import { ConfigService } from '../../libs/config/config.service';
import { EmailService } from '../../libs/email/email.service';
import { PrismaService } from '../../libs/prisma/prisma.service';
import { UserResponse } from '../user/dto';
import {
  AuthCompleteProfileDto,
  AuthLoginDto,
  AuthLoginResponse,
  AuthResendForgotPasswordEmailDto,
  AuthResendVerificationEmailDto,
  AuthResetPasswordDto,
  AuthSendForgotPasswordDto,
  AuthSignupDto,
  AuthSignupResponse,
  AuthVerifyEmailDto,
  AuthVerifyEmailResponse,
} from './dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly jwtService: CustomJwtService,
    private readonly config: ConfigService,
  ) {}

  private async hashPassword(plain: string): Promise<string> {
    const salt = await bcrypt.genSalt(this.config.bcryptRounds);
    return bcrypt.hash(plain, salt);
  }

  private async verifyPassword(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }

  private mapUserToResponse(user: User): UserResponse {
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
      isProfileCompleted: user.isProfileCompleted,
    };
  }

  async signup(payload: AuthSignupDto): Promise<AuthSignupResponse> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: payload.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    // Create user first, then send email separately to avoid transaction timeout
    const newUser = await this.prisma.user.create({
      data: {
        firstName: '',
        lastName: '',
        role: UserRole.student,
        isEmailVerified: false,
        medicalCollegeName: '',
        email: payload.email,
        phone: null,
        mmbsPassingYear: null,
        password: '', // Will be set during profile completion
        isProfileCompleted: false,
      },
    });

    const token = this.jwtService.generateEmailToken(newUser.email, 'verify');

    // Send verification email after user creation
    await this.emailService.sendTemplate('verify-email', {
      to: newUser.email,
      email: newUser.email,
      token,
    });

    return {
      message: 'Verification email sent. Please check your email to continue.',
    };
  }

  async completeProfile(
    payload: AuthCompleteProfileDto,
    userId: string,
  ): Promise<UserResponse> {
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

    // Update user profile first, then send welcome email separately
    const updatedUser = await this.prisma.user.update({
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
        isProfileCompleted: true,
      },
    });

    // Send welcome email after profile update
    await this.emailService.sendTemplate('welcome-email', {
      to: updatedUser.email,
      firstName: updatedUser.firstName,
    });

    // No token generation here - user should login after profile completion
    return this.mapUserToResponse(updatedUser);
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
      throw new BadRequestException(
        'Profile not completed. Please complete your profile first.',
      );
    }

    const isPasswordValid = await this.verifyPassword(
      payload.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { accessToken, refreshToken } = this.jwtService.generateTokens(
      user.id,
      user.role,
    );

    return {
      accessToken,
      refreshToken,
      user: this.mapUserToResponse(user),
    };
  }

  async verifyEmail(
    payload: AuthVerifyEmailDto,
  ): Promise<AuthVerifyEmailResponse> {
    let decoded: { email: string; purpose: 'verify' | 'reset' };

    try {
      decoded = this.jwtService.verify(payload.token);
    } catch {
      throw new BadRequestException('Invalid verification token');
    }

    if (decoded.email !== payload.email || decoded.purpose !== 'verify') {
      throw new BadRequestException('Invalid verification token or user email');
    }

    const user = await this.prisma.user.findUnique({
      where: { email: payload.email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email already verified');
    }

    // Update user verification status
    await this.prisma.user.update({
      where: { email: payload.email },
      data: { isEmailVerified: true },
    });

    // Generate tokens for the verified user
    const { accessToken, refreshToken } = this.jwtService.generateTokens(
      user.id,
      user.role,
    );

    return {
      accessToken,
      refreshToken,
      user: this.mapUserToResponse(user),
    };
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

    const token = this.jwtService.generateEmailToken(user.email, 'reset');

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
      decoded = this.jwtService.verify(payload.token);
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
    const payload = await this.jwtService.verifyAsync<{
      userId: string;
      role: UserRole;
      type: 'refresh';
    }>(refreshToken);

    if (payload.type !== 'refresh') {
      throw new BadRequestException('Invalid refresh token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const accessToken = this.jwtService.generateAccessToken(user.id, user.role);

    return { accessToken };
  }

  async resendVerificationEmail(
    payload: AuthResendVerificationEmailDto,
  ): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email: payload.email },
    });

    if (!user) {
      throw new NotFoundException('User with this email does not exist');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    const token = this.jwtService.generateEmailToken(user.email, 'verify');

    await this.emailService.sendTemplate('verify-email', {
      to: user.email,
      email: user.email,
      token,
    });

    return { message: 'Verification email resent successfully' };
  }

  async resendForgotPasswordEmail(
    payload: AuthResendForgotPasswordEmailDto,
  ): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email: payload.email },
    });

    if (!user) {
      throw new NotFoundException('User with this email does not exist');
    }

    const token = this.jwtService.generateEmailToken(user.email, 'reset');

    await this.emailService.sendTemplate('forget-pass-email', {
      to: user.email,
      email: user.email,
      token,
    });

    return { message: 'Password reset email resent successfully' };
  }
}
