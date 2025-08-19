import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../../libs/prisma/prisma.service';

export const RoleGuard = (minRole: UserRole) => {
  return class implements CanActivate {
    constructor(public readonly prisma: PrismaService) {}

    async canActivate(context: ExecutionContext) {
      const request = context.switchToHttp().getRequest();
      const userId = request.user?.id;

      if (!userId) {
        throw new InternalServerErrorException(
          'You are not authorized to access this resource',
        );
      }

      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });

      if (!user) {
        throw new InternalServerErrorException('User not found');
      }

      const scoreMap: Record<UserRole, number> = {
        admin: 2,
        student: 1,
      };

      const requiredScore = scoreMap[minRole];
      const actualScore = scoreMap[user.role];

      const permitted = actualScore >= requiredScore;

      if (!permitted) {
        throw new ForbiddenException(
          'You are not allowed to perform this action',
        );
      }

      return true;
    }
  };
};
