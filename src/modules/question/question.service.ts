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
    } = query;

    const skip = (page - 1) * limit;

    const where: any = {
      isDeleted: false,
    };

    if (year) where.year = year;
    if (intake) where.intake = intake;
    if (categories && categories.length > 0) {
      where.categories = { hasSome: categories };
    }
    if (sourceFile) where.sourceFile = sourceFile;
    if (search) {
      where.mainQuestion = { contains: search, mode: 'insensitive' };
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
    data: CreateQuestionDto,
  ): Promise<CreateQuestionResponse> {
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
        mainQuestion: data.mainQuestion,
        aiRephrasedQuestion: data.mainQuestion,
        question: data.mainQuestion,
        intake: data.intake,
        categories: data.categories,
        explanation: data.explanation || '',
        description: data.description || '',
        year: data.year,
        correctAnswer: data.correctAnswer,
        options: data.options,
        sourceFile: data.sourceFile,
      },
    });

    return { message: 'Question created successfully' };
  }

  async updateQuestion(
    id: string,
    data: UpdateQuestionDto,
  ): Promise<UpdateQuestionResponse> {
    // Check if question exists and is not locked
    const existingQuestion = await this.prisma.question.findUnique({
      where: { id, isDeleted: false },
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
        ...(data.mainQuestion && {
          mainQuestion: data.mainQuestion,
          question: data.mainQuestion, // Update the original question field too
        }),
        ...(data.year && { year: data.year }),
        ...(data.intake && { intake: data.intake }),
        ...(data.categories && { categories: data.categories }),
        ...(data.explanation !== undefined && {
          explanation: data.explanation,
        }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.correctAnswer && { correctAnswer: data.correctAnswer }),
        ...(data.options && { options: data.options }),
        ...(data.sourceFile !== undefined && { sourceFile: data.sourceFile }),
      },
    });

    return { message: 'Question updated successfully' };
  }

  async deleteQuestion(id: string): Promise<DeleteQuestionResponse> {
    const question = await this.prisma.question.findUnique({
      where: { id, isDeleted: false },
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    // Soft delete by setting isDeleted flag
    await this.prisma.question.update({
      where: { id },
      data: { isDeleted: true },
    });

    return { message: 'Question deleted successfully' };
  }

  async lockQuestionUpdate(id: string): Promise<LockQuestionResponse> {
    const question = await this.prisma.question.findUnique({
      where: { id, isDeleted: false },
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    if (question.isQuestionUpdateLocked) {
      throw new BadRequestException('Question is already locked');
    }

    await this.prisma.question.update({
      where: { id },
      data: { isQuestionUpdateLocked: true },
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
      // Get unique years and source files from questions
      this.prisma.question.findMany({
        where: { isDeleted: false },
        select: { year: true, sourceFile: true },
      }),
    ]);

    // Extract unique years and source files
    const uniqueYears = [
      ...new Set(yearsAndSourceFiles.map((q) => q.year)),
    ].sort();
    const uniqueSourceFiles = [
      ...new Set(
        yearsAndSourceFiles
          .map((q) => q.sourceFile)
          .filter(
            (file): file is string => file !== null && file !== undefined,
          ),
      ),
    ].sort();

    return {
      intakes,
      categories,
      years: uniqueYears,
      sourceFiles: uniqueSourceFiles,
    };
  }

  async getQuestionById(id: string): Promise<Question> {
    const question = await this.prisma.question.findUnique({
      where: { id, isDeleted: false },
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    return question;
  }
}
