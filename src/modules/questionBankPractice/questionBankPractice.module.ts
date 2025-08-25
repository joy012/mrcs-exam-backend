import { Module } from '@nestjs/common';
import { QuestionBankPracticeController } from './questionBankPractice.controller';
import { QuestionBankPracticeService } from './questionBankPractice.service';

@Module({
  controllers: [QuestionBankPracticeController],
  providers: [QuestionBankPracticeService],
  exports: [QuestionBankPracticeService],
})
export class QuestionBankPracticeModule {}
