import {
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { ExamIntake } from '@prisma/client';
import { DEFAULT_EXAM_INTAKES } from '../../constants/default-data';
import { PrismaService } from '../../libs/prisma/prisma.service';
import { UpdateExamIntakeDto } from './dto/payloads';

@Injectable()
export class ExamIntakeService implements OnModuleInit {
  private readonly logger = new Logger(ExamIntakeService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.preseedExamIntakes();
  }

  private async preseedExamIntakes() {
    const existingIntakes = await this.prisma.examIntake.count();

    if (existingIntakes > 0) {
      this.logger.log('Exam intakes already preseeded');
      return;
    }

    await this.prisma.examIntake.createMany({
      data: DEFAULT_EXAM_INTAKES,
    });
    this.logger.log('Exam intakes preseeded successfully');
  }

  async getAllExamIntakes(): Promise<ExamIntake[]> {
    return await this.prisma.examIntake.findMany({
      orderBy: { createdAt: 'asc' },
    });
  }

  async getExamIntakeById(id: string): Promise<ExamIntake> {
    const examIntake = await this.prisma.examIntake.findUnique({
      where: { id },
    });

    if (!examIntake) {
      throw new NotFoundException('Exam intake not found');
    }

    return examIntake;
  }

  async updateExamIntakeActiveStatus(
    id: string,
    data: UpdateExamIntakeDto,
  ): Promise<ExamIntake> {
    const examIntake = await this.getExamIntakeById(id);

    if (!examIntake) {
      throw new NotFoundException('Exam intake not found');
    }

    return await this.prisma.examIntake.update({
      where: { id },
      data: { isActive: data.isActive },
    });
  }
}
