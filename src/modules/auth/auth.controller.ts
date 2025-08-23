import { TypedBody, TypedParam, TypedRoute } from '@nestia/core';
import { Controller, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { UserId } from '../../common/decorators/user.decorators';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { EmailService } from '../../libs/email/email.service';
import { AuthService } from './auth.service';
import {
  AuthCompleteProfileDto,
  AuthLoginDto,
  AuthResendForgotPasswordEmailDto,
  AuthResendVerificationEmailDto,
  AuthResetPasswordDto,
  AuthSendForgotPasswordDto,
  AuthSignupDto,
  AuthVerifyEmailDto,
  CreateSessionDto,
  RefreshTokenBody,
} from './dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly emailService: EmailService,
  ) {}

  @TypedRoute.Post('signup')
  async signup(@TypedBody() body: AuthSignupDto) {
    return await this.authService.signup(body);
  }

  @UseGuards(JwtAuthGuard)
  @TypedRoute.Post('complete-profile')
  async completeProfile(
    @TypedBody() body: AuthCompleteProfileDto,
    @UserId() userId: string,
  ) {
    return await this.authService.completeProfile(body, userId);
  }

  @TypedRoute.Post('login')
  async login(@TypedBody() body: AuthLoginDto, @Req() req: Request) {
    const ipAddress = req.ip || req.connection.remoteAddress || '';
    return await this.authService.login(body, ipAddress);
  }

  @TypedRoute.Post('verify-email')
  async verifyEmail(
    @TypedBody() body: AuthVerifyEmailDto,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || req.connection.remoteAddress || '';
    return await this.authService.verifyEmail(body, ipAddress);
  }

  @TypedRoute.Post('forgot-password')
  async forgotPassword(@TypedBody() body: AuthSendForgotPasswordDto) {
    return await this.authService.sendForgotPassword(body);
  }

  @TypedRoute.Post('reset-password')
  async resetPassword(@TypedBody() body: AuthResetPasswordDto) {
    return await this.authService.resetPassword(body);
  }

  @TypedRoute.Post('refresh')
  async refresh(@TypedBody() body: RefreshTokenBody) {
    return await this.authService.refreshToken(body.refreshToken);
  }

  @TypedRoute.Post('resend-verification')
  async resendVerificationEmail(
    @TypedBody() body: AuthResendVerificationEmailDto,
  ) {
    return await this.authService.resendVerificationEmail(body);
  }

  @TypedRoute.Post('resend-forgot-password')
  async resendForgotPasswordEmail(
    @TypedBody() body: AuthResendForgotPasswordEmailDto,
  ) {
    return await this.authService.resendForgotPasswordEmail(body);
  }

  @UseGuards(JwtAuthGuard)
  @TypedRoute.Post('logout')
  async logout(@UserId() userId: string) {
    return await this.authService.logout(userId);
  }

  @UseGuards(JwtAuthGuard)
  @TypedRoute.Post('logout/:sessionId')
  async logoutSession(
    @UserId() userId: string,
    @TypedParam('sessionId') sessionId: string,
  ) {
    return await this.authService.logout(userId, sessionId);
  }

  @UseGuards(JwtAuthGuard)
  @TypedRoute.Post('session')
  async createSession(
    @UserId() userId: string,
    @TypedBody() body: CreateSessionDto,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || req.connection.remoteAddress || '';
    return await this.authService.createSessionForUser(
      userId,
      body.session,
      ipAddress,
    );
  }

  @UseGuards(JwtAuthGuard)
  @TypedRoute.Post('terminate-all-sessions')
  async terminateAllSessions(@UserId() userId: string) {
    return await this.authService.terminateAllSessions(userId);
  }

  @TypedRoute.Get('test-email')
  async testEmail() {
    const result = await this.emailService.testConnection();
    return {
      success: result,
      message: result
        ? 'Email connection successful'
        : 'Email connection failed',
    };
  }
}
