import { TypedBody, TypedRoute } from '@nestia/core';
import { Controller, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-guard';
import { UpdateUserDto, UserMeResponse } from './dto';
import { UserService } from './user.service';

interface JwtRequest extends Request {
  user?: { sub?: string; id?: string };
}

@UseGuards(JwtAuthGuard)
@ApiTags('User')
@ApiBearerAuth()
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @TypedRoute.Get('me')
  async getMe(@Req() req: JwtRequest): Promise<UserMeResponse> {
    const userId = (req.user?.sub || req.user?.id) as string;
    return this.userService.getMe(userId);
  }

  @TypedRoute.Patch('me')
  async updateMe(
    @Req() req: JwtRequest,
    @TypedBody() body: UpdateUserDto,
  ): Promise<UserMeResponse> {
    const userId = (req.user?.sub || req.user?.id) as string;
    return this.userService.updateMe(userId, body);
  }
}
