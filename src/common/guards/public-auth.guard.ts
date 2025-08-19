import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from 'src/libs/config/config.service';

@Injectable()
export class AppPublicAuthGuard implements CanActivate {
  constructor(private config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const appAuthKeyHeader = request.headers['app-auth-key'];

    if (!appAuthKeyHeader || typeof appAuthKeyHeader !== 'string') {
      throw new UnauthorizedException('App auth key is required');
    }

    const appAuthKey = this.config.appAuthKey;

    if (!appAuthKey) {
      throw new UnauthorizedException('App auth key not configured');
    }

    if (appAuthKey !== appAuthKeyHeader) {
      throw new UnauthorizedException('App auth key is invalid');
    }

    // Store the validated auth key in the request for potential use in controllers
    request.appAuthKey = appAuthKey;
    return true;
  }
}
