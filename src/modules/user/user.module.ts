import { Module } from '@nestjs/common';
import { ConfigModule } from '../../libs/config';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [ConfigModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
