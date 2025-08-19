import { Injectable } from '@nestjs/common';
import { Question } from '@prisma/client';
import { PrismaService } from '../../libs/prisma/prisma.service';
import { GetAllQuestionsQueryDto, QuestionsListResponse } from './dto';

@Injectable()
export class QuestionService {
  constructor(private readonly prisma: PrismaService) {}

  private mapQuestionToResponse(question: Question): Question {
    return {
      id: question.id,
      question: question.question,
      aiRephrasedQuestion: question.aiRephrasedQuestion,
      approvedQuestion: question.approvedQuestion,
      intakeId: question.intakeId,
      categoryIds: question.categoryIds,
      explanation: question.explanation,
      year: question.year,
      correctAnswer: question.correctAnswer,
      options: question.options as Record<string, string>,
      isDeleted: question.isDeleted,
      sourceFile: question.sourceFile,
      createdAt: question.createdAt,
      updatedAt: question.updatedAt,
      lastUpdatedBy: question.lastUpdatedBy,
      isQuestionUpdateLocked: question.isQuestionUpdateLocked,
    };
  }

  async getAllQuestions(
    query: GetAllQuestionsQueryDto,
  ): Promise<QuestionsListResponse> {
    const {
      page = 1,
      limit = 20,
      year,
      intakeId,
      categoryIds,
      search,
      sourceFile,
    } = query;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      isDeleted: false,
    };

    if (year) {
      where.year = year;
    }

    if (intakeId) {
      where.intakeId = intakeId;
    }

    if (categoryIds && categoryIds.length > 0) {
      where.categoryIds = {
        hasSome: categoryIds,
      };
    }

    if (sourceFile) {
      where.sourceFile = sourceFile;
    }

    if (search) {
      where.OR = [
        { question: { contains: search, mode: 'insensitive' } },
        { aiRephrasedQuestion: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get total count
    const total = await this.prisma.question.count({ where });

    // Get questions with pagination
    const questions = await this.prisma.question.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    return {
      questions: questions.map((question) =>
        this.mapQuestionToResponse(question),
      ),
      totalCount: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }
}
