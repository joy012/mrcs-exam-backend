import { TypedBody, TypedRoute } from '@nestia/core';
import { Controller, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserId } from 'src/common/decorators/user.decorators';
import { JwtAuthGuard } from '../../common/guards/jwt-guard';
import { UpdateUserDto, UserMeResponse } from './dto';
import { UserService } from './user.service';

@UseGuards(JwtAuthGuard)
@ApiTags('User')
@ApiBearerAuth()
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @TypedRoute.Get('me')
  async getMe(@UserId() userId: string): Promise<UserMeResponse> {
    return await this.userService.getMe(userId);
  }

  @TypedRoute.Patch('me')
  async updateMe(
    @UserId() userId: string,
    @TypedBody() body: UpdateUserDto,
  ): Promise<UserMeResponse> {
    return this.userService.updateMe(userId, body);
  }
}
