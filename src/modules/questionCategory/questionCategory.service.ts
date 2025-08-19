import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { QuestionCategory, QuestionCategoryType } from '@prisma/client';
import { DEFAULT_QUESTION_CATEGORIES } from '../../constants/default-data';
import { PrismaService } from '../../libs/prisma/prisma.service';
import {
  CreateQuestionCategoryDto,
  UpdateQuestionCategoryDto,
} from './dto/payloads';

@Injectable()
export class QuestionCategoryService implements OnModuleInit {
  private readonly logger = new Logger(QuestionCategoryService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.preseedQuestionCategories();
  }

  private async preseedQuestionCategories() {
    const existingCategories = await this.prisma.questionCategory.count();

    if (existingCategories > 0) {
      this.logger.log('Question categories already preseeded');
      return;
    }

    await this.prisma.questionCategory.createMany({
      data: DEFAULT_QUESTION_CATEGORIES,
    });
    this.logger.log('Question categories preseeded successfully');
  }

  async getAllQuestionCategories(): Promise<QuestionCategory[]> {
    return await this.prisma.questionCategory.findMany({
      orderBy: [{ type: 'asc' }, { displayName: 'asc' }],
    });
  }

  async getQuestionCategoryById(id: string): Promise<QuestionCategory> {
    const questionCategory = await this.prisma.questionCategory.findUnique({
      where: { id },
    });

    if (!questionCategory) {
      throw new NotFoundException('Question category not found');
    }

    return questionCategory;
  }

  async getQuestionCategoriesByType(
    type: QuestionCategoryType,
  ): Promise<QuestionCategory[]> {
    return await this.prisma.questionCategory.findMany({
      where: { type },
      orderBy: { displayName: 'asc' },
    });
  }

  async createQuestionCategory(
    data: CreateQuestionCategoryDto,
  ): Promise<QuestionCategory> {
    return await this.prisma.questionCategory.create({
      data: {
        displayName: data.displayName,
        type: data.type,
        isActive: true,
        isDefault: false,
      },
    });
  }

  async updateQuestionCategory(
    id: string,
    data: UpdateQuestionCategoryDto,
  ): Promise<QuestionCategory> {
    const questionCategory = await this.getQuestionCategoryById(id);

    if (!questionCategory) {
      throw new NotFoundException('Question category not found');
    }

    return await this.prisma.questionCategory.update({
      where: { id },
      data: {
        displayName: data.displayName,
        isActive: data.isActive,
      },
    });
  }

  async deleteQuestionCategory(id: string): Promise<void> {
    const questionCategory = await this.getQuestionCategoryById(id);

    if (questionCategory.isDefault) {
      throw new BadRequestException(
        'Default question categories cannot be deleted',
      );
    }

    await this.prisma.questionCategory.delete({
      where: { id },
    });
  }

  async updateQuestionCategoryActiveStatus(
    id: string,
    isActive: boolean,
  ): Promise<QuestionCategory> {
    const questionCategory = await this.getQuestionCategoryById(id);

    if (!questionCategory) {
      throw new NotFoundException('Question category not found');
    }

    return await this.prisma.questionCategory.update({
      where: { id },
      data: { isActive },
    });
  }
}
