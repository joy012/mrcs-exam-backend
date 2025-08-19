import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { CustomJwtModule } from 'src/libs/jwt/jwt.module';
import { JwtStrategy } from '../../common/strategies/jwt.strategy';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [CustomJwtModule, PassportModule],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
