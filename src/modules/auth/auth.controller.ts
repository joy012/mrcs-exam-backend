import { TypedBody, TypedRoute } from '@nestia/core';
import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
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
  constructor(private readonly authService: AuthService) {}

  @TypedRoute.Post('signup')
  async signup(@TypedBody() body: AuthSignupDto) {
    return await this.authService.signup(body);
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
}
