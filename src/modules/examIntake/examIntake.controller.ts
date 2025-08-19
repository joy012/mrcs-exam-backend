import { TypedBody, TypedParam, TypedRoute } from '@nestia/core';
import { Controller, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { RoleGuard } from '../../common/guards/role.guard';
import { UpdateExamIntakeDto } from './dto/payloads';
import { ExamIntakeService } from './examIntake.service';

@UseGuards(JwtAuthGuard, RoleGuard('admin'))
@ApiTags('Exam Intake')
@ApiBearerAuth()
@Controller('exam-intake')
export class ExamIntakeController {
  constructor(private readonly examIntakeService: ExamIntakeService) {}

  @TypedRoute.Get()
  async getAllExamIntakes() {
    return await this.examIntakeService.getAllExamIntakes();
  }

  @TypedRoute.Get(':id')
  async getExamIntakeById(@TypedParam('id') id: string) {
    return await this.examIntakeService.getExamIntakeById(id);
  }

  @TypedRoute.Patch(':id/active-status')
  async updateExamIntakeActiveStatus(
    @TypedParam('id') id: string,
    @TypedBody() body: UpdateExamIntakeDto,
  ) {
    return await this.examIntakeService.updateExamIntakeActiveStatus(id, body);
  }
}
