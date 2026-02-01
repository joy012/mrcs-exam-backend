import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Question, QuestionCategory } from '@prisma/client';
import { PrismaService } from '../../libs/prisma/prisma.service';
import {
  CreateQuestionDto,
  GetAllQuestionsQueryDto,
  QuestionFiltersResponse,
  QuestionsListResponse,
  UpdateQuestionDto,
} from './dto';
import {
  CreateQuestionResponse,
  DeleteQuestionResponse,
  LockQuestionResponse,
  UpdateQuestionResponse,
} from './dto/responses';

@Injectable()
export class QuestionService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllQuestions(
    query: GetAllQuestionsQueryDto,
  ): Promise<QuestionsListResponse> {
    const {
      page = 1,
      limit = 20,
      year,
      intake,
      categories,
      search,
      sourceFile,
      lastUpdatedBy,
      status,
    } = query;

    const skip = (page - 1) * limit;

    const where: any = {};

    if (year) where.year = year;
    if (intake) where.intake = intake;
    if (categories && categories.length > 0) {
      where.categories = { hasSome: categories };
    }
    if (sourceFile) where.sourceFile = sourceFile;
    if (lastUpdatedBy) where.lastUpdatedBy = lastUpdatedBy;
    if (status && status !== 'all') {
      where.isQuestionUpdateLocked = status === 'locked';
    }
    if (search) {
      where.question = { contains: search, mode: 'insensitive' };
    }

    // Execute count and data fetch in parallel
    const [total, questions] = await Promise.all([
      this.prisma.question.count({ where }),
      this.prisma.question.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    if (questions.length === 0) {
      return {
        questions: [],
        totalCount: total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      };
    }

    // Get unique IDs efficiently
    const intakeIds = [...new Set(questions.map((q) => q.intake))];
    const categoryIds = [...new Set(questions.flatMap((q) => q.categories))];

    // Fetch related data in parallel
    const [questionIntake, questionCategories] = await Promise.all([
      this.prisma.examIntake.findMany({
        where: { id: { in: intakeIds } },
        select: {
          id: true,
          displayName: true,
        },
      }),
      this.prisma.questionCategory.findMany({
        where: { id: { in: categoryIds } },
        select: {
          id: true,
          displayName: true,
        },
      }),
    ]);

    // Create lookup maps
    const intakeMap = new Map(questionIntake.map((i) => [i.id, i]));
    const categoryMap = new Map(questionCategories.map((c) => [c.id, c]));

    // Map questions with related data
    const mappedQuestions = questions.map((question) => ({
      ...question,
      intake: intakeMap.get(question.intake)!,
      categories: question.categories
        .map((id) => categoryMap.get(id))
        .filter(Boolean) as QuestionCategory[],
    }));

    return {
      questions: mappedQuestions,
      totalCount: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  async createQuestion(
    data: CreateQuestionDto & { createdBy: string },
  ): Promise<CreateQuestionResponse> {
    // check if question title already exists
    const existingQuestion = await this.prisma.question.findFirst({
      where: { question: data.question },
    });

    if (existingQuestion) {
      throw new BadRequestException('Question with this title already exists');
    }

    // Validate intake exists
    const intake = await this.prisma.examIntake.findUnique({
      where: { id: data.intake },
    });
    if (!intake) {
      throw new NotFoundException('Exam intake not found');
    }

    // Validate categories exist
    if (data.categories && data.categories.length > 0) {
      const categories = await this.prisma.questionCategory.findMany({
        where: { id: { in: data.categories } },
      });
      if (categories.length !== data.categories.length) {
        throw new NotFoundException(
          'One or more question categories not found',
        );
      }
    }

    await this.prisma.question.create({
      data: {
        question: data.question,
        intake: data.intake,
        categories: data.categories,
        explanation: data.explanation || '',
        year: data.year,
        correctAnswer: data.correctAnswer,
        options: data.options,
        sourceFile: data.sourceFile,
        lastUpdatedBy: data.createdBy,
        isQuestionUpdateLocked: data.isQuestionUpdateLocked || false,
      },
    });

    return { message: 'Question created successfully' };
  }

  async updateQuestion(
    id: string,
    data: UpdateQuestionDto & { lastUpdatedBy: string },
  ): Promise<UpdateQuestionResponse> {
    // Check if question exists and is not locked
    const existingQuestion = await this.prisma.question.findUnique({
      where: { id },
    });

    if (!existingQuestion) {
      throw new NotFoundException('Question not found');
    }

    if (existingQuestion.isQuestionUpdateLocked) {
      throw new BadRequestException('Question is locked and cannot be updated');
    }

    // Validate intake if provided
    if (data.intake) {
      const intake = await this.prisma.examIntake.findUnique({
        where: { id: data.intake },
      });
      if (!intake) {
        throw new NotFoundException('Exam intake not found');
      }
    }

    // Validate categories if provided
    if (data.categories && data.categories.length > 0) {
      const categories = await this.prisma.questionCategory.findMany({
        where: { id: { in: data.categories } },
      });
      if (categories.length !== data.categories.length) {
        throw new NotFoundException(
          'One or more question categories not found',
        );
      }
    }

    // Update question
    await this.prisma.question.update({
      where: { id },
      data: {
        ...(data.question && {
          question: data.question,
        }),
        ...(data.year && { year: data.year }),
        ...(data.intake && { intake: data.intake }),
        ...(data.categories && { categories: data.categories }),
        ...(data.explanation !== undefined && {
          explanation: data.explanation,
        }),
        ...(data.correctAnswer && { correctAnswer: data.correctAnswer }),
        ...(data.options && { options: data.options }),
        ...(data.sourceFile !== undefined && { sourceFile: data.sourceFile }),
        ...(data.lastUpdatedBy && { lastUpdatedBy: data.lastUpdatedBy }),
        ...(data.isQuestionUpdateLocked !== undefined && {
          isQuestionUpdateLocked: data.isQuestionUpdateLocked,
        }),
      },
    });

    return { message: 'Question updated successfully' };
  }

  async deleteQuestion(id: string): Promise<DeleteQuestionResponse> {
    const question = await this.prisma.question.findUnique({
      where: { id },
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.question.delete({
        where: {
          id,
        },
      });

      await tx.questionBankPractice.deleteMany({
        where: {
          questionId: id,
        },
      });
    });

    return { message: 'Question deleted successfully' };
  }

  async toggleLockQuestion(
    id: string,
    updatedBy: string,
  ): Promise<LockQuestionResponse> {
    const question = await this.prisma.question.findUnique({
      where: { id },
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    await this.prisma.question.update({
      where: { id },
      data: {
        isQuestionUpdateLocked: !question.isQuestionUpdateLocked,
        lastUpdatedBy: updatedBy,
      },
    });

    return {
      message: 'Question locked successfully',
    };
  }

  async getQuestionFilters(): Promise<QuestionFiltersResponse> {
    // Execute all queries in parallel for optimal performance
    const [intakes, categories, yearsAndSourceFiles] = await Promise.all([
      // Get active intakes
      this.prisma.examIntake.findMany({
        where: { isActive: true },
        select: { id: true, displayName: true },
        orderBy: { displayName: 'asc' },
      }),
      // Get active categories
      this.prisma.questionCategory.findMany({
        where: { isActive: true },
        select: { id: true, displayName: true },
        orderBy: [{ type: 'asc' }, { displayName: 'asc' }],
      }),
      // Get unique years, source files, and lastUpdatedBy from questions
      this.prisma.question.findMany({
        select: { year: true, sourceFile: true, lastUpdatedBy: true },
      }),
    ]);

    // Extract unique years, source files, and lastUpdatedBy
    const uniqueYears: string[] = [
      ...new Set(yearsAndSourceFiles.map((q) => q.year)),
    ].sort();
    const uniqueSourceFiles: string[] = [
      ...new Set(
        yearsAndSourceFiles
          .map((q) => q.sourceFile)
          .filter(
            (file): file is string => file !== null && file !== undefined,
          ),
      ),
    ].sort();
    const uniqueLastUpdatedBy: string[] = [
      ...new Set(
        yearsAndSourceFiles
          .map((q) => q.lastUpdatedBy)
          .filter(
            (user): user is string => user !== null && user !== undefined,
          ),
      ),
    ].sort();

    return {
      intakes,
      categories,
      years: uniqueYears,
      sourceFiles: uniqueSourceFiles,
      lastUpdatedBy: uniqueLastUpdatedBy,
    };
  }

  async getQuestionById(id: string): Promise<Question> {
    const question = await this.prisma.question.findUnique({
      where: { id },
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    return question;
  }
}
