import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Question, QuestionBankPractice } from '@prisma/client';
import { PrismaService } from '../../libs/prisma/prisma.service';
import {
  CreateQuestionBankAnswerDto,
  GetQuestionBankQueryDto,
  ResetQuestionBankDto,
  UpdateQuestionBankNoteDto,
} from './dto';
import {
  QuestionBankFiltersResponse,
  QuestionBankItemResponse,
  QuestionBankListResponse,
  QuestionBankStatsResponse,
} from './dto/responses';

@Injectable()
export class QuestionBankPracticeService {
  constructor(private readonly prisma: PrismaService) {}

  async getQuestionBank(
    userId: string,
    query: GetQuestionBankQueryDto,
  ): Promise<QuestionBankListResponse> {
    const {
      limit = 20,
      page = 1,
      year,
      intake,
      categories,
      note = 'all',
      isCorrect = 'all',
      favorite = 'all',
      search,
    } = query;

    const questionWhere = this.buildQuestionWhereClause({
      year,
      intake,
      categories,
      search,
    });

    // Use aggregation pipeline for better performance
    const questionsWithPractice =
      await this.getQuestionsWithPracticeAggregation(
        userId,
        questionWhere,
        limit,
        page,
        note,
        isCorrect,
        favorite,
      );

    const { questions, totalCount } = questionsWithPractice;

    // Convert BSON date objects (e.g. { $date: "2025-08-25T...Z" }) to native JS Date instances
    const sanitizedQuestions = questions.map(
      (q) => this.transformDateFields(q) as QuestionBankItemResponse,
    );

    return {
      questions: sanitizedQuestions,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    };
  }

  async createQuestionBankAnswer(
    userId: string,
    data: CreateQuestionBankAnswerDto,
  ): Promise<{ message: string; isCorrect: boolean }> {
    const question = await this.validateQuestionExists(data.questionId);
    const isCorrect = data.userAnswer === question.correctAnswer;

    await this.upsertPracticeRecord(userId, data.questionId, {
      userAnswer: data.userAnswer,
      isCorrect,
    });

    return {
      message: 'Answer saved successfully',
      isCorrect,
    };
  }

  async updateQuestionBankNote(
    userId: string,
    questionId: string,
    data: UpdateQuestionBankNoteDto,
  ): Promise<{ message: string }> {
    await this.validateQuestionExists(questionId);

    await this.upsertPracticeRecord(userId, questionId, {
      note: data.note,
    });

    return { message: 'Note updated successfully' };
  }

  async resetQuestionBank(
    userId: string,
    data: ResetQuestionBankDto,
  ): Promise<{ message: string; resetCount: number }> {
    const questionWhere = this.buildPrismaQuestionWhereClause({
      year: data.year,
      intake: data.intake,
      categories: data.categories,
    });

    const questionIds = await this.getQuestionIds(questionWhere);

    if (questionIds.length === 0) {
      throw new BadRequestException(
        'No questions found with the specified criteria',
      );
    }

    const result = await this.prisma.questionBankPractice.updateMany({
      where: {
        userId,
        questionId: { in: questionIds },
      },
      data: {
        userAnswer: null,
        isCorrect: null,
        updatedAt: new Date(),
      },
    });

    return {
      message: 'Question bank reset successfully',
      resetCount: result.count,
    };
  }

  async getQuestionBankStats(
    userId: string,
  ): Promise<QuestionBankStatsResponse> {
    const [
      totalQuestions,
      answeredQuestions,
      correctAnswers,
      wrongAnswers,
      questionsWithNotes,
    ] = await Promise.all([
      this.prisma.question.count({ where: { isDeleted: false } }),
      this.prisma.questionBankPractice.count({
        where: {
          userId,
          userAnswer: { not: null },
        },
      }),
      this.prisma.questionBankPractice.count({
        where: {
          userId,
          isCorrect: true,
        },
      }),
      this.prisma.questionBankPractice.count({
        where: {
          userId,
          isCorrect: false,
        },
      }),
      this.prisma.questionBankPractice.count({
        where: {
          userId,
          AND: [{ note: { not: null } }, { note: { not: '' } }],
        },
      }),
    ]);

    const accuracy = this.calculateAccuracy(answeredQuestions, correctAnswers);

    return {
      totalQuestions,
      answeredQuestions,
      correctAnswers,
      wrongAnswers,
      questionsWithNotes,
      accuracy,
    };
  }

  async toggleFavorite(
    userId: string,
    questionId: string,
  ): Promise<{ message: string }> {
    await this.validateQuestionExists(questionId);

    const existingPractice = await this.getPracticeRecord(userId, questionId);

    if (existingPractice) {
      return this.updateExistingFavorite(userId, questionId, existingPractice);
    } else {
      return this.createNewFavorite(userId, questionId);
    }
  }

  async getQuestionBankFilters(): Promise<QuestionBankFiltersResponse> {
    // Execute all queries in parallel for optimal performance
    const [intakes, categories, years] = await Promise.all([
      // Get active intakes
      this.prisma.examIntake.findMany({
        where: { isActive: true },
        select: { id: true, displayName: true },
        orderBy: { displayName: 'asc' },
      }),
      // Get active categories
      this.prisma.questionCategory.findMany({
        where: { isActive: true },
        select: { id: true, displayName: true, type: true },
        orderBy: [{ type: 'asc' }, { displayName: 'asc' }],
      }),
      // Get unique years from questions
      this.prisma.question.findMany({
        where: { isDeleted: false },
        select: { year: true },
        distinct: ['year'],
        orderBy: { year: 'desc' },
      }),
    ]);

    // Extract unique years
    const uniqueYears = years
      .map((y) => y.year)
      .sort((a, b) => b.localeCompare(a));

    return {
      intakes,
      categories,
      years: uniqueYears,
    };
  }

  // Private helper methods
  private buildQuestionWhereClause(params: {
    year?: string;
    intake?: string;
    categories?: string[];
    search?: string;
  }) {
    const where: Record<string, any> = { isDeleted: false };

    if (params.year) where.year = params.year;
    // Store intake for separate handling in aggregation pipeline
    if (params.intake) where.intake = params.intake;

    // Store categories for separate handling in aggregation pipeline
    if (params.categories && params.categories.length > 0) {
      where.categories = params.categories;
    }

    if (params.search) {
      where.$or = [
        { question: { $regex: params.search, $options: 'i' } },
        { explanation: { $regex: params.search, $options: 'i' } },
      ];
    }

    return where;
  }

  private buildPrismaQuestionWhereClause(params: {
    year?: string;
    intake?: string;
    categories?: string[];
    search?: string;
  }) {
    const where: Record<string, any> = { isDeleted: false };

    if (params.year) where.year = params.year;
    if (params.intake) where.intake = params.intake;
    if (params.categories && params.categories.length > 0) {
      where.categories = { hasSome: params.categories };
    }
    if (params.search) {
      where.OR = [
        { question: { contains: params.search, mode: 'insensitive' } },
        { explanation: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    return where;
  }

  private async getQuestionsWithPracticeAggregation(
    userId: string,
    where: Record<string, any>,
    limit: number,
    page: number,
    note: string = 'all',
    isCorrect: string = 'all',
    favorite: string = 'all',
  ): Promise<{ questions: any[]; totalCount: number }> {
    // Convert Prisma where clause to MongoDB format
    const mongoWhere = this.convertPrismaWhereToMongo(where);

    // Build the aggregation pipeline for questions
    const questionsPipeline: any[] = [
      // Match questions based on criteria
      { $match: mongoWhere },
    ];

    // Add intake filter if specified
    if (where.intake) {
      const intakeFilter = {
        $match: {
          $expr: {
            $eq: ['$intake', { $toObjectId: where.intake }],
          },
        },
      };
      questionsPipeline.push(intakeFilter);
    }

    // Add categories filter if specified
    if (where.categories && where.categories.length > 0) {
      const categoryObjectIds = where.categories.map((categoryId) => ({
        $toObjectId: categoryId,
      }));
      const categoriesFilter = {
        $match: {
          $expr: {
            $gt: [
              {
                $size: {
                  $setIntersection: ['$categories', categoryObjectIds],
                },
              },
              0,
            ],
          },
        },
      };
      questionsPipeline.push(categoriesFilter);
    }

    // Lookup intake information
    questionsPipeline.push({
      $lookup: {
        from: 'ExamIntake',
        localField: 'intake',
        foreignField: '_id',
        as: 'intakeData',
      },
    });

    // Lookup categories information
    questionsPipeline.push({
      $lookup: {
        from: 'QuestionCategory',
        localField: 'categories',
        foreignField: '_id',
        as: 'categoriesData',
      },
    });

    // Lookup practice data for the user
    questionsPipeline.push({
      $lookup: {
        from: 'QuestionBankPractice',
        let: { questionId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$questionId', '$$questionId'] },
                  { $eq: ['$userId', { $toObjectId: userId }] },
                ],
              },
            },
          },
        ],
        as: 'practiceData',
      },
    });

    // Unwind practice data (will be empty array if no practice)
    questionsPipeline.push({
      $unwind: { path: '$practiceData', preserveNullAndEmptyArrays: true },
    });

    // Add computed fields
    questionsPipeline.push({
      $addFields: {
        id: { $toString: '$_id' },
        intake: {
          id: { $toString: '$intake' },
          displayName: {
            $ifNull: [
              { $arrayElemAt: ['$intakeData.displayName', 0] },
              '$intake',
            ],
          },
        },
        categories: {
          $map: {
            input: '$categoriesData',
            as: 'cat',
            in: {
              id: { $toString: '$$cat._id' },
              displayName: '$$cat.displayName',
              type: '$$cat.type',
            },
          },
        },
        userAnswer: {
          $cond: {
            if: { $eq: ['$practiceData.userAnswer', null] },
            then: '$$REMOVE',
            else: '$practiceData.userAnswer',
          },
        },
        note: {
          $cond: {
            if: { $eq: ['$practiceData.note', null] },
            then: '$$REMOVE',
            else: '$practiceData.note',
          },
        },
        isCorrect: {
          $cond: {
            if: { $eq: ['$practiceData.isCorrect', null] },
            then: '$$REMOVE',
            else: '$practiceData.isCorrect',
          },
        },
        isFavorite: { $ifNull: ['$practiceData.isFavorite', false] },
        // Ensure createdAt is properly formatted
        createdAt: { $ifNull: ['$createdAt', new Date()] },
        updatedAt: { $ifNull: ['$updatedAt', new Date()] },
      },
    });

    // Remove unnecessary fields
    questionsPipeline.push({
      $project: {
        _id: 0,
        intakeData: 0,
        categoriesData: 0,
        practiceData: 0,
      },
    });

    // Sort by creation date
    questionsPipeline.push({ $sort: { createdAt: -1 } });

    // Apply practice filters
    questionsPipeline.push(
      ...this.buildPracticeFilterPipeline(note, isCorrect, favorite),
    );

    // Build count pipeline for total count
    const countPipeline: any[] = [{ $match: mongoWhere }];

    // Add intake filter to count pipeline as well
    if (where.intake) {
      countPipeline.push({
        $match: {
          $expr: {
            $eq: ['$intake', { $toObjectId: where.intake }],
          },
        },
      });
    }

    // Add categories filter to count pipeline as well
    if (where.categories && where.categories.length > 0) {
      const categoryObjectIds = where.categories.map((categoryId) => ({
        $toObjectId: categoryId,
      }));
      countPipeline.push({
        $match: {
          $expr: {
            $gt: [
              {
                $size: {
                  $setIntersection: ['$categories', categoryObjectIds],
                },
              },
              0,
            ],
          },
        },
      });
    }

    // Add practice data lookup for filtering in count pipeline
    if (note !== 'all' || isCorrect !== 'all' || favorite !== 'all') {
      countPipeline.push({
        $lookup: {
          from: 'QuestionBankPractice',
          let: { questionId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$questionId', '$$questionId'] },
                    { $eq: ['$userId', { $toObjectId: userId }] },
                  ],
                },
              },
            },
          ],
          as: 'practiceData',
        },
      });

      countPipeline.push({
        $unwind: { path: '$practiceData', preserveNullAndEmptyArrays: true },
      });

      countPipeline.push({
        $addFields: {
          userAnswer: {
            $cond: {
              if: { $eq: ['$practiceData.userAnswer', null] },
              then: '$$REMOVE',
              else: '$practiceData.userAnswer',
            },
          },
          note: {
            $cond: {
              if: { $eq: ['$practiceData.note', null] },
              then: '$$REMOVE',
              else: '$practiceData.note',
            },
          },
          isCorrect: {
            $cond: {
              if: { $eq: ['$practiceData.isCorrect', null] },
              then: '$$REMOVE',
              else: '$practiceData.isCorrect',
            },
          },
          isFavorite: { $ifNull: ['$practiceData.isFavorite', false] },
        },
      });
    }

    countPipeline.push(
      ...this.buildPracticeFilterPipeline(note, isCorrect, favorite),
      { $count: 'total' },
    );

    // Execute both pipelines in parallel for optimal performance
    const [questionsResult, countResult] = await Promise.all([
      this.prisma.question.aggregateRaw({
        pipeline: [
          ...questionsPipeline,
          { $skip: (page - 1) * limit },
          { $limit: limit },
        ],
      }),
      this.prisma.question.aggregateRaw({
        pipeline: countPipeline,
      }),
    ]);

    // Extract total count
    const totalCount =
      Array.isArray(countResult) && countResult.length > 0
        ? countResult[0].total
        : 0;

    // Handle the questions result
    const questions = Array.isArray(questionsResult) ? questionsResult : [];

    return { questions, totalCount };
  }

  private convertPrismaWhereToMongo(
    where: Record<string, any>,
  ): Record<string, any> {
    const mongoWhere: Record<string, any> = { isDeleted: false };

    // Convert Prisma where clause to MongoDB format
    if (where.year) mongoWhere.year = where.year;
    // Note: Intake is handled separately in the aggregation pipeline
    // Do not include intake in the initial $match stage

    // Note: Categories are handled separately in the aggregation pipeline using $setIntersection
    // Do not include categories in the initial $match stage

    if (where.search) {
      mongoWhere.$or = [
        { question: { $regex: where.search, $options: 'i' } },
        { explanation: { $regex: where.search, $options: 'i' } },
      ];
    }

    return mongoWhere;
  }

  private buildPracticeFilterPipeline(
    note: string,
    isCorrect: string,
    favorite: string,
  ): any[] {
    const filters: any[] = [];

    if (note === 'with_note') {
      filters.push({
        $match: { note: { $exists: true, $ne: null, $nin: ['', null] } },
      });
    } else if (note === 'without_note') {
      filters.push({
        $match: {
          $or: [{ note: { $exists: false } }, { note: null }, { note: '' }],
        },
      });
    }

    if (isCorrect === 'correct') {
      filters.push({ $match: { isCorrect: true } });
    } else if (isCorrect === 'incorrect') {
      filters.push({ $match: { isCorrect: false } });
    }

    if (favorite === 'favorite') {
      filters.push({ $match: { isFavorite: true } });
    } else if (favorite === 'not_favorite') {
      filters.push({ $match: { isFavorite: false } });
    }

    return filters;
  }

  private async validateQuestionExists(questionId: string): Promise<Question> {
    const question = await this.prisma.question.findUnique({
      where: { id: questionId, isDeleted: false },
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    return question;
  }

  private async upsertPracticeRecord(
    userId: string,
    questionId: string,
    data: {
      userAnswer?: string;
      isCorrect?: boolean;
      note?: string;
    },
  ): Promise<QuestionBankPractice> {
    return this.prisma.questionBankPractice.upsert({
      where: {
        userId_questionId: { userId, questionId },
      },
      update: {
        ...data,
        updatedAt: new Date(),
      },
      create: {
        userId,
        questionId,
        ...data,
      },
    });
  }

  private async getQuestionIds(where: Record<string, any>): Promise<string[]> {
    const questions = await this.prisma.question.findMany({
      where,
      select: { id: true },
    });
    return questions.map((q) => q.id);
  }

  private calculateAccuracy(
    answeredQuestions: number,
    correctAnswers: number,
  ): number {
    if (answeredQuestions === 0) return 0;
    const accuracy = (correctAnswers / answeredQuestions) * 100;
    return Math.round(accuracy * 100) / 100;
  }

  private async getPracticeRecord(
    userId: string,
    questionId: string,
  ): Promise<QuestionBankPractice | null> {
    return this.prisma.questionBankPractice.findUnique({
      where: {
        userId_questionId: { userId, questionId },
      },
    });
  }

  private async updateExistingFavorite(
    userId: string,
    questionId: string,
    existingPractice: QuestionBankPractice,
  ): Promise<{ message: string }> {
    const updatedPractice = await this.prisma.questionBankPractice.update({
      where: {
        userId_questionId: { userId, questionId },
      },
      data: {
        isFavorite: !existingPractice.isFavorite,
        updatedAt: new Date(),
      },
    });

    return {
      message: updatedPractice.isFavorite
        ? 'Question added to favorites'
        : 'Question removed from favorites',
    };
  }

  private async createNewFavorite(
    userId: string,
    questionId: string,
  ): Promise<{ message: string }> {
    await this.prisma.questionBankPractice.create({
      data: {
        userId,
        questionId,
        isFavorite: true,
      },
    });

    return { message: 'Question added to favorites' };
  }

  /**
   * Recursively traverses an object and converts BSON date objects in the form
   * of { $date: string } produced by MongoDB raw aggregation to native
   * JavaScript Date instances so that Nestia validation can recognise them as
   * Date.
   */
  private transformDateFields(obj: unknown): unknown {
    if (Array.isArray(obj)) {
      return obj.map((item) => this.transformDateFields(item));
    }

    if (obj && typeof obj === 'object') {
      // If the object itself represents a date coming from BSON
      const maybeBson = obj as Record<string, unknown>;
      if ('$date' in maybeBson && typeof maybeBson.$date === 'string') {
        return new Date(String(maybeBson.$date));
      }

      // Handle MongoDB ObjectId conversion
      if ('$oid' in maybeBson && typeof maybeBson.$oid === 'string') {
        return maybeBson.$oid;
      }

      // Otherwise iterate over its keys
      return Object.entries(obj as Record<string, unknown>).reduce(
        (acc, [key, value]) => {
          acc[key] = this.transformDateFields(value);
          return acc;
        },
        {} as Record<string, unknown>,
      );
    }

    return obj;
  }
}
