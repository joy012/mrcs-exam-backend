import { TypedBody, TypedParam, TypedQuery, TypedRoute } from '@nestia/core';
import { Controller, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { User } from 'src/common/decorators/user.decorators';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { RoleGuard } from '../../common/guards/role.guard';
import {
  CreateQuestionDto,
  GetAllQuestionsQueryDto,
  UpdateQuestionDto,
} from './dto';
import { QuestionService } from './question.service';

@UseGuards(JwtAuthGuard, RoleGuard('admin'))
@ApiTags('Question')
@ApiBearerAuth()
@Controller('question')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @TypedRoute.Get()
  async getAllQuestions(@TypedQuery() query: GetAllQuestionsQueryDto) {
    return await this.questionService.getAllQuestions(query);
  }

  @TypedRoute.Post()
  async createQuestion(
    @User() UserName: string,
    @TypedBody() data: CreateQuestionDto,
  ) {
    return await this.questionService.createQuestion({
      ...data,
      createdBy: UserName,
    });
  }

  @TypedRoute.Put(':id')
  async updateQuestion(
    @User() UserName: string,
    @TypedParam('id') id: string,
    @TypedBody() data: UpdateQuestionDto,
  ) {
    return await this.questionService.updateQuestion(id, {
      ...data,
      lastUpdatedBy: UserName,
    });
  }

  @TypedRoute.Delete(':id')
  async deleteQuestion(@TypedParam('id') id: string) {
    return await this.questionService.deleteQuestion(id);
  }

  @TypedRoute.Patch(':id/lock')
  async lockQuestionUpdate(@TypedParam('id') id: string) {
    return await this.questionService.lockQuestionUpdate(id);
  }

  @TypedRoute.Get('filters')
  async getQuestionFilters() {
    return await this.questionService.getQuestionFilters();
  }
}
