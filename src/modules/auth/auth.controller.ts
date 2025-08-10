import { TypedBody, TypedRoute } from '@nestia/core';
import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  AuthLoginDto,
  AuthLoginResponse,
  AuthResetPasswordDto,
  AuthSendForgotPasswordDto,
  AuthSignupDto,
  AuthSignupResponse,
  AuthVerifyEmailDto,
  EmptyResponse,
} from './dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @TypedRoute.Post('signup')
  async signup(@TypedBody() body: AuthSignupDto): Promise<AuthSignupResponse> {
    return this.authService.signup(body);
  }

  @TypedRoute.Post('login')
  async login(@TypedBody() body: AuthLoginDto): Promise<AuthLoginResponse> {
    return this.authService.login(body);
  }

  @TypedRoute.Post('verify-email')
  async verifyEmail(
    @TypedBody() body: AuthVerifyEmailDto,
  ): Promise<EmptyResponse> {
    await this.authService.verifyEmail(body);
    return {};
  }

  @TypedRoute.Post('forgot-password')
  async forgotPassword(
    @TypedBody() body: AuthSendForgotPasswordDto,
  ): Promise<EmptyResponse> {
    await this.authService.sendForgotPassword(body);
    return {};
  }

  @TypedRoute.Post('reset-password')
  async resetPassword(
    @TypedBody() body: AuthResetPasswordDto,
  ): Promise<EmptyResponse> {
    await this.authService.resetPassword(body);
    return {};
  }
}
