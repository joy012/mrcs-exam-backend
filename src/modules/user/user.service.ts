import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../../libs/prisma/prisma.service';
import { UpdateUserDto, UserResponse } from './dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  private mapUserToResponse(user: User): UserResponse {
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

  private async findUserById(userId: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
        isDeleted: false,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  private buildUpdateData(payload: UpdateUserDto) {
    return {
      firstName: payload.firstName ?? undefined,
      lastName: payload.lastName ?? undefined,
      medicalCollegeName: payload.medicalCollegeName ?? undefined,
      phone: payload.phone ?? undefined,
      mmbsPassingYear:
        payload.mmbsPassingYear !== undefined
          ? String(payload.mmbsPassingYear)
          : undefined,
    };
  }

  async getMe(userId: string): Promise<UserResponse> {
    const user = await this.findUserById(userId);
    return this.mapUserToResponse(user);
  }

  async updateMe(
    userId: string,
    payload: UpdateUserDto,
  ): Promise<UserResponse> {
    await this.findUserById(userId); // Verify user exists

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: this.buildUpdateData(payload),
    });

    return this.mapUserToResponse(updatedUser);
  }

  async getUserByID(userId: string): Promise<UserResponse> {
    const user = await this.findUserById(userId);
    return this.mapUserToResponse(user);
  }

  async updateUserByID(
    userId: string,
    payload: UpdateUserDto,
  ): Promise<UserResponse> {
    await this.findUserById(userId); // Verify user exists

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: this.buildUpdateData(payload),
    });

    return this.mapUserToResponse(updatedUser);
  }

  async deleteUserByID(userId: string): Promise<{ message: string }> {
    await this.findUserById(userId); // Verify user exists

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

    return users.map((user) => this.mapUserToResponse(user));
  }
}
