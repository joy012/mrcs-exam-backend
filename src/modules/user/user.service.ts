import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../libs/prisma/prisma.service';
import { UpdateUserDto, UserMeResponse } from './dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(userId: string): Promise<UserMeResponse> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      medicalCollegeName: user.medicalCollegeName,
      phone: user.phone ?? undefined,
      mmbsPassingYear: user.mmbsPassingYear
        ? Number(user.mmbsPassingYear)
        : undefined,
      avatarURL: user.avatarURL ?? undefined,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  async updateMe(
    userId: string,
    payload: UpdateUserDto,
  ): Promise<UserMeResponse> {
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        firstName: payload.firstName ?? undefined,
        lastName: payload.lastName ?? undefined,
        medicalCollegeName: payload.medicalCollegeName ?? undefined,
        phone: payload.phone ?? undefined,
        mmbsPassingYear:
          payload.mmbsPassingYear !== undefined
            ? String(payload.mmbsPassingYear)
            : undefined,
        avatarURL: payload.avatarURL,
      },
    });

    return this.getMe(updated.id);
  }
}
