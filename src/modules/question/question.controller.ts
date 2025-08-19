import { TypedQuery, TypedRoute } from '@nestia/core';
import { Controller, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { RoleGuard } from '../../common/guards/role.guard';
import { GetAllQuestionsQueryDto, QuestionsListResponse } from './dto';
import { QuestionService } from './question.service';

@UseGuards(JwtAuthGuard, RoleGuard('admin'))
@ApiTags('Question')
@ApiBearerAuth()
@Controller('question')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @TypedRoute.Get()
  async getAllQuestions(
    @TypedQuery() query: GetAllQuestionsQueryDto,
  ): Promise<QuestionsListResponse> {
    return await this.questionService.getAllQuestions(query);
  }
}
