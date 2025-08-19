import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../libs/prisma/prisma.service';
import { UpdateUserDto, UserResponse } from './dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(userId: string): Promise<UserResponse> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
        isDeleted: false,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      medicalCollegeName: user.medicalCollegeName,
      phone: user.phone,
      mmbsPassingYear: user.mmbsPassingYear,
      avatarURL: user.avatarURL,
      isDeleted: user.isDeleted,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async updateMe(
    userId: string,
    payload: UpdateUserDto,
  ): Promise<UserResponse> {
    const updated = await this.prisma.user.update({
      where: {
        id: userId,
        isDeleted: false,
      },
      data: {
        firstName: payload.firstName ?? undefined,
        lastName: payload.lastName ?? undefined,
        medicalCollegeName: payload.medicalCollegeName ?? undefined,
        phone: payload.phone ?? undefined,
        mmbsPassingYear:
          payload.mmbsPassingYear !== undefined
            ? String(payload.mmbsPassingYear)
            : undefined,
      },
    });

    return this.getMe(updated.id);
  }

  async getUserByID(userId: string): Promise<UserResponse> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
        isDeleted: false,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      medicalCollegeName: user.medicalCollegeName,
      phone: user.phone,
      mmbsPassingYear: user.mmbsPassingYear,
      avatarURL: user.avatarURL,
      isDeleted: user.isDeleted,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async updateUserByID(
    userId: string,
    payload: UpdateUserDto,
  ): Promise<UserResponse> {
    const updated = await this.prisma.user.update({
      where: {
        id: userId,
        isDeleted: false,
      },
      data: {
        firstName: payload.firstName ?? undefined,
        lastName: payload.lastName ?? undefined,
        medicalCollegeName: payload.medicalCollegeName ?? undefined,
        phone: payload.phone ?? undefined,
        mmbsPassingYear:
          payload.mmbsPassingYear !== undefined
            ? String(payload.mmbsPassingYear)
            : undefined,
      },
    });

    return this.getUserByID(updated.id);
  }

  async deleteUserByID(userId: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
        isDeleted: false,
      },
    });
    if (!user) throw new NotFoundException('User not found');

    // Soft delete - mark as deleted instead of removing from database
    await this.prisma.user.update({
      where: { id: userId },
      data: { isDeleted: true },
    });

    return { message: 'User deleted successfully' };
  }

  async getAllUsers(): Promise<UserResponse[]> {
    const users = await this.prisma.user.findMany({
      where: {
        isDeleted: false,
        role: { not: 'admin' },
      },
      orderBy: { createdAt: 'desc' },
    });

    return users.map((user) => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      medicalCollegeName: user.medicalCollegeName,
      phone: user.phone,
      mmbsPassingYear: user.mmbsPassingYear,
      avatarURL: user.avatarURL,
      isDeleted: user.isDeleted,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));
  }
}
