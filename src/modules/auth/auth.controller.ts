import { TypedBody, TypedRoute } from '@nestia/core';
import { Controller, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserId } from '../../common/decorators/user.decorators';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { EmailService } from '../../libs/email/email.service';
import { AuthService } from './auth.service';
import {
  AuthCompleteProfileDto,
  AuthLoginDto,
  AuthResetPasswordDto,
  AuthSendForgotPasswordDto,
  AuthSignupDto,
  AuthVerifyEmailDto,
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
  async login(@TypedBody() body: AuthLoginDto) {
    return await this.authService.login(body);
  }

  @TypedRoute.Post('verify-email')
  async verifyEmail(@TypedBody() body: AuthVerifyEmailDto) {
    return await this.authService.verifyEmail(body);
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
