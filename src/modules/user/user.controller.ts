import { TypedBody, TypedParam, TypedRoute } from '@nestia/core';
import { Controller, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserId } from 'src/common/decorators/user.decorators';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { RoleGuard } from '../../common/guards/role.guard';
import { UpdateUserDto } from './dto';
import { UserService } from './user.service';

@UseGuards(JwtAuthGuard)
@ApiTags('User')
@ApiBearerAuth()
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @TypedRoute.Get('me')
  async getMe(@UserId() userId: string) {
    return await this.userService.getMe(userId);
  }

  @TypedRoute.Patch('me')
  async updateMe(@UserId() userId: string, @TypedBody() body: UpdateUserDto) {
    return this.userService.updateMe(userId, body);
  }

  @UseGuards(RoleGuard('admin'))
  @TypedRoute.Get()
  async getAllUsers() {
    return await this.userService.getAllUsers();
  }

  @UseGuards(RoleGuard('admin'))
  @TypedRoute.Get(':id')
  async getUserByID(@TypedParam('id') id: string) {
    return await this.userService.getUserByID(id);
  }

  @UseGuards(RoleGuard('admin'))
  @TypedRoute.Patch(':id')
  async updateUserByID(
    @TypedParam('id') id: string,
    @TypedBody() body: UpdateUserDto,
  ) {
    return await this.userService.updateUserByID(id, body);
  }

  @UseGuards(RoleGuard('admin'))
  @TypedRoute.Delete(':id')
  async deleteUserByID(@TypedParam('id') id: string) {
    return await this.userService.deleteUserByID(id);
  }
}
