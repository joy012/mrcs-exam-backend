import { TypedBody, TypedParam, TypedRoute } from '@nestia/core';
import { Controller, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { QuestionCategoryType } from '@prisma/client';
import { JwtAuthGuard } from '../../common/guards/jwt.guard';
import { RoleGuard } from '../../common/guards/role.guard';
import { QuestionCategoryService } from './questionCategory.service';
import { CreateQuestionCategoryDto, UpdateQuestionCategoryDto } from './dto';

@UseGuards(JwtAuthGuard, RoleGuard('admin'))
@ApiTags('Question Category')
@ApiBearerAuth()
@Controller('question-category')
export class QuestionCategoryController {
  constructor(
    private readonly questionCategoryService: QuestionCategoryService,
  ) {}

  @TypedRoute.Get()
  async getAllQuestionCategories() {
    return await this.questionCategoryService.getAllQuestionCategories();
  }

  @TypedRoute.Get('type/:type')
  async getQuestionCategoriesByType(
    @TypedParam('type') type: QuestionCategoryType,
  ) {
    return await this.questionCategoryService.getQuestionCategoriesByType(type);
  }

  @TypedRoute.Get(':id')
  async getQuestionCategoryById(@TypedParam('id') id: string) {
    return await this.questionCategoryService.getQuestionCategoryById(id);
  }

  @TypedRoute.Post()
  async createQuestionCategory(@TypedBody() body: CreateQuestionCategoryDto) {
    return await this.questionCategoryService.createQuestionCategory(body);
  }

  @TypedRoute.Patch(':id')
  async updateQuestionCategory(
    @TypedParam('id') id: string,
    @TypedBody() body: UpdateQuestionCategoryDto,
  ) {
    return await this.questionCategoryService.updateQuestionCategory(id, body);
  }

  @TypedRoute.Patch(':id/active-status')
  async updateQuestionCategoryActiveStatus(
    @TypedParam('id') id: string,
    @TypedBody() body: { isActive: boolean },
  ) {
    return await this.questionCategoryService.updateQuestionCategoryActiveStatus(
      id,
      body.isActive,
    );
  }

  @TypedRoute.Delete(':id')
  async deleteQuestionCategory(@TypedParam('id') id: string) {
    return await this.questionCategoryService.deleteQuestionCategory(id);
  }
}
