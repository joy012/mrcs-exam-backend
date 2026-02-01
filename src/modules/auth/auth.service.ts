import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { SessionStatus, User, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { CustomJwtService } from '../../libs/jwt/jwt.service';
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
  CreateSessionResponse,
  LogoutResponse,
  SessionInfoDto,
  SessionResponse,
  TerminateAllSessionsResponse,
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

  private mapSessionToResponse(session: any): SessionResponse {
    return {
      id: session.id,
      deviceName: session.deviceName,
      userAgent: session.userAgent,
      ipAddress: session.ipAddress,
      status: session.status,
      createdAt: session.createdAt.toISOString(),
      lastSeenAt: session.lastSeenAt.toISOString(),
      revokedAt: session.revokedAt?.toISOString(),
    };
  }

  private async getUserSessions(userId: string): Promise<SessionResponse[]> {
    const sessions = await this.prisma.session.findMany({
      where: { userId },
      orderBy: { lastSeenAt: 'desc' },
    });

    return sessions.map((session) => this.mapSessionToResponse(session));
  }

  private async createSession(
    userId: string,
    sessionInfo: SessionInfoDto,
    ipAddress?: string,
  ): Promise<SessionResponse> {
    // Check if same device already exists (by deviceName AND userAgent) - regardless of status
    const whereCondition = {
      userId,
      deviceName: sessionInfo.deviceName,
      ...(sessionInfo.userAgent && { userAgent: sessionInfo.userAgent }),
    };

    const existingSession = await this.prisma.session.findFirst({
      where: whereCondition,
      orderBy: {
        lastSeenAt: 'desc', // Get the most recent session for this device
      },
    });

    if (existingSession) {
      // Reactivate existing session (whether it was ACTIVE or TERMINATED)
      const updatedSession = await this.prisma.session.update({
        where: { id: existingSession.id },
        data: {
          userAgent: sessionInfo.userAgent,
          ipAddress: ipAddress || sessionInfo.ipAddress,
          lastSeenAt: new Date(),
          status: 'ACTIVE',
          revokedAt: null, // Clear the revoked timestamp
        },
      });
      return this.mapSessionToResponse(updatedSession);
    }

    // Create new session only if no session exists for this device combination
    const newSession = await this.prisma.session.create({
      data: {
        userId,
        deviceName: sessionInfo.deviceName,
        userAgent: sessionInfo.userAgent,
        ipAddress: ipAddress || sessionInfo.ipAddress,
        status: 'ACTIVE',
      },
    });

    return this.mapSessionToResponse(newSession);
  }

  private async checkActiveSession(
    userId: string,
    status?: SessionStatus,
    currentDeviceName?: string,
    currentUserAgent?: string,
  ): Promise<SessionResponse | null> {
    const baseCondition = {
      userId,
      status: status || ('ACTIVE' as const), // Default to checking only ACTIVE sessions
    };

    // Build the where condition based on available parameters
    let whereCondition: any = baseCondition;

    // Exclude current device by both deviceName and userAgent if both are provided
    if (currentDeviceName && currentUserAgent) {
      whereCondition = {
        ...baseCondition,
        NOT: {
          AND: [
            { deviceName: currentDeviceName },
            { userAgent: currentUserAgent },
          ],
        },
      };
    } else if (currentDeviceName) {
      // Fallback to deviceName only if userAgent is not provided
      whereCondition = {
        ...baseCondition,
        deviceName: { not: currentDeviceName },
      };
    } else if (currentUserAgent) {
      // Fallback to userAgent only if deviceName is not provided
      whereCondition = {
        ...baseCondition,
        userAgent: { not: currentUserAgent },
      };
    }

    const activeSession = await this.prisma.session.findFirst({
      where: whereCondition,
    });

    return activeSession ? this.mapSessionToResponse(activeSession) : null;
  }

  async terminateSession(userId: string, sessionId?: string): Promise<void> {
    const whereClause = sessionId
      ? { id: sessionId, userId }
      : { userId, status: 'ACTIVE' as const };

    await this.prisma.session.updateMany({
      where: whereClause,
      data: {
        status: 'TERMINATED',
        revokedAt: new Date(),
      },
    });
  }

  async terminateAllSessions(
    userId: string,
  ): Promise<TerminateAllSessionsResponse> {
    const result = await this.prisma.session.updateMany({
      where: {
        userId,
        status: 'ACTIVE',
      },
      data: {
        status: 'TERMINATED',
        revokedAt: new Date(),
      },
    });

    return {
      message: 'All sessions terminated successfully',
      terminatedCount: result.count,
    };
  }

  async createSessionForUser(
    userId: string,
    sessionInfo: SessionInfoDto,
    ipAddress?: string,
  ): Promise<CreateSessionResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    const isAdmin = user?.role === UserRole.admin;

    // Students: only one active session; admins: allow multiple sessions
    if (!isAdmin) {
      const activeSession = await this.checkActiveSession(userId);
      if (activeSession) {
        throw new BadRequestException(
          `You are already logged in on ${activeSession.deviceName}. Please logout from that device to continue here.`,
        );
      }
    }

    const session = await this.createSession(userId, sessionInfo, ipAddress);
    const allSessions = await this.getUserSessions(userId);

    return {
      session,
      sessions: allSessions?.length > 0 ? allSessions : [session],
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

  async login(
    payload: AuthLoginDto,
    ipAddress?: string,
  ): Promise<AuthLoginResponse> {
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

    // Handle session management if session info provided
    if (payload.session) {
      // Admins: allow multiple sessions; students: only one active session per user
      const isAdmin = user.role === UserRole.admin;
      if (!isAdmin) {
        const activeSession = await this.checkActiveSession(
          user.id,
          'ACTIVE',
          payload.session.deviceName,
          payload.session.userAgent,
        );
        if (activeSession) {
          throw new BadRequestException(
            `You are already logged in on ${activeSession.deviceName}. Please logout from that device to continue here.`,
          );
        }
      }

      // Create or update session for this device
      await this.createSession(user.id, payload.session, ipAddress);
    }

    const { accessToken, refreshToken } = this.jwtService.generateTokens(
      user.id,
      user.role,
    );

    // Get all user sessions
    const sessions = await this.getUserSessions(user.id);

    return {
      accessToken,
      refreshToken,
      user: this.mapUserToResponse(user),
      sessions,
    };
  }

  async verifyEmail(
    payload: AuthVerifyEmailDto,
    ipAddress?: string,
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

    // Handle session management if session info provided
    if (payload.session) {
      // Admins: allow multiple sessions; students: only one active session per user
      const isAdmin = user.role === UserRole.admin;
      if (!isAdmin) {
        const activeSession = await this.checkActiveSession(
          user.id,
          'ACTIVE',
          payload.session.deviceName,
          payload.session.userAgent,
        );
        if (activeSession) {
          throw new BadRequestException(
            `You are already logged in on ${activeSession.deviceName}. Please logout from that device to continue here.`,
          );
        }
      }

      // Create session for this device
      await this.createSession(user.id, payload.session, ipAddress);
    }

    // Generate tokens for the verified user
    const { accessToken, refreshToken } = this.jwtService.generateTokens(
      user.id,
      user.role,
    );

    // Get all user sessions
    const sessions = await this.getUserSessions(user.id);

    return {
      accessToken,
      refreshToken,
      user: this.mapUserToResponse(user),
      sessions,
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

  async logout(userId: string, sessionId?: string): Promise<LogoutResponse> {
    await this.terminateSession(userId, sessionId);
    return { message: 'Logged out successfully' };
  }
}
