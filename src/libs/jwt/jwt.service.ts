import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import { ConfigService } from '../config/config.service';

export interface JwtPayload {
  userId: string;
  role: UserRole;
}

export interface JwtTokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class CustomJwtService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Generate access and refresh tokens for a user
   */
  generateTokens(userId: string, role: UserRole): JwtTokens {
    const accessToken = this.jwtService.sign(
      { userId, role },
      {
        secret: this.config.jwtSecret,
        expiresIn: this.config.jwtAccessTokenExpiresIn,
      },
    );

    const refreshToken = this.jwtService.sign(
      { userId, role, type: 'refresh' },
      {
        secret: this.config.jwtSecret,
        expiresIn: this.config.jwtRefreshTokenExpiresIn,
      },
    );

    return { accessToken, refreshToken };
  }

  /**
   * Generate access token only
   */
  generateAccessToken(userId: string, role: UserRole): string {
    return this.jwtService.sign(
      { userId, role },
      {
        secret: this.config.jwtSecret,
        expiresIn: this.config.jwtAccessTokenExpiresIn,
      },
    );
  }

  /**
   * Generate email verification/reset token
   */
  generateEmailToken(email: string, purpose: 'verify' | 'reset'): string {
    return this.jwtService.sign(
      { email, purpose },
      {
        secret: this.config.jwtSecret,
        expiresIn: '1d',
      },
    );
  }

  /**
   * Verify and decode JWT token
   */
  verify<T = JwtPayload>(token: string): T {
    try {
      return this.jwtService.verify(token, {
        secret: this.config.jwtSecret,
      }) as T;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  /**
   * Verify and decode JWT token asynchronously
   */
  async verifyAsync<T = JwtPayload>(token: string): Promise<T> {
    try {
      return (await this.jwtService.verifyAsync(token, {
        secret: this.config.jwtSecret,
      })) as T;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}
