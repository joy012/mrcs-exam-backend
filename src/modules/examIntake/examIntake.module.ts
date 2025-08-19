import { Module } from '@nestjs/common';
import { PrismaModule } from '../../libs/prisma/prisma.module';
import { ExamIntakeController } from './examIntake.controller';
import { ExamIntakeService } from './examIntake.service';

@Module({
  imports: [PrismaModule],
  controllers: [ExamIntakeController],
  providers: [ExamIntakeService],
  exports: [ExamIntakeService],
})
export class ExamIntakeModule {}
