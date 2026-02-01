import { TypedBody, TypedParam, TypedQuery, TypedRoute } from '@nestia/core';
import { Controller, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserId } from '../../common/decorators/user.decorators';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { RoleGuard } from '../../common/guards/role.guard';
import {
  CreateQuestionBankAnswerDto,
  GetQuestionBankQueryDto,
  ResetQuestionBankDto,
  ToggleFavoriteDto,
  UpdateQuestionBankNoteDto,
} from './dto';
import { QuestionBankPracticeService } from './questionBankPractice.service';

@UseGuards(JwtAuthGuard, RoleGuard('student'))
@ApiTags('Question Bank Practice')
@ApiBearerAuth()
@Controller('question-bank-practice')
export class QuestionBankPracticeController {
  constructor(
    private readonly questionBankPracticeService: QuestionBankPracticeService,
  ) {}

  @TypedRoute.Get()
  async getQuestionBank(
    @UserId() userId: string,
    @TypedQuery() query: GetQuestionBankQueryDto,
  ) {
    return await this.questionBankPracticeService.getQuestionBank(
      userId,
      query,
    );
  }

  @TypedRoute.Get('filters')
  async getQuestionBankFilters() {
    return await this.questionBankPracticeService.getQuestionBankFilters();
  }

  @TypedRoute.Get('stats')
  async getQuestionBankStats(@UserId() userId: string) {
    return await this.questionBankPracticeService.getQuestionBankStats(userId);
  }

  @TypedRoute.Post('answer')
  async createQuestionBankAnswer(
    @UserId() userId: string,
    @TypedBody() data: CreateQuestionBankAnswerDto,
  ) {
    return await this.questionBankPracticeService.createQuestionBankAnswer(
      userId,
      data,
    );
  }

  @TypedRoute.Put(':questionId/note')
  async updateQuestionBankNote(
    @UserId() userId: string,
    @TypedParam('questionId') questionId: string,
    @TypedBody() data: UpdateQuestionBankNoteDto,
  ) {
    return await this.questionBankPracticeService.updateQuestionBankNote(
      userId,
      questionId,
      data,
    );
  }

  @TypedRoute.Post('reset')
  async resetQuestionBank(
    @UserId() userId: string,
    @TypedBody() data: ResetQuestionBankDto,
  ) {
    return await this.questionBankPracticeService.resetQuestionBank(
      userId,
      data,
    );
  }

  @TypedRoute.Post('toggle-favorite')
  async toggleFavorite(
    @UserId() userId: string,
    @TypedBody() data: ToggleFavoriteDto,
  ) {
    return await this.questionBankPracticeService.toggleFavorite(
      userId,
      data.questionId,
    );
  }
}
