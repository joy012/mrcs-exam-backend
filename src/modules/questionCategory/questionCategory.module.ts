import { Module } from '@nestjs/common';
import { PrismaModule } from '../../libs/prisma/prisma.module';
import { QuestionCategoryController } from './questionCategory.controller';
import { QuestionCategoryService } from './questionCategory.service';

@Module({
  imports: [PrismaModule],
  controllers: [QuestionCategoryController],
  providers: [QuestionCategoryService],
  exports: [QuestionCategoryService],
})
export class QuestionCategoryModule {}
