import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserResponse } from 'src/modules/user/dto';

export const User = createParamDecorator(
  (_, ctx: ExecutionContext): UserResponse => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as UserResponse;
  },
);

export const UserId = createParamDecorator(
  (_, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();

    if (!request.user) {
      throw new Error(
        'User not found in request. Make sure JWT guard is applied.',
      );
    }

    return (request.user as UserResponse).id;
  },
);

export const UserRole = createParamDecorator(
  (_, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();

    if (!request.user) {
      throw new Error(
        'User not found in request. Make sure JWT guard is applied.',
      );
    }

    return (request.user as UserResponse).role;
  },
);

export const AccessToken = createParamDecorator(
  (_, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();

    const tokenParts = request.headers.authorization?.split(' ');

    return tokenParts && tokenParts.length > 1 ? (tokenParts[1] as string) : '';
  },
);
