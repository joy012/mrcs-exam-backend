import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './libs/config/config.module';
import { EmailModule } from './libs/email/email.module';
import { PrismaModule } from './libs/prisma/prisma.module';
import { StorageModule } from './libs/storage/storage.module';
import { AdminModule } from './modules/admin/admin.module';
import { AuthModule } from './modules/auth/auth.module';
import { ExamIntakeModule } from './modules/examIntake/examIntake.module';
import { QuestionModule } from './modules/question/question.module';
import { QuestionCategoryModule } from './modules/questionCategory/questionCategory.module';
import { QuestionBankPracticeModule } from './modules/questionBankPractice/questionBankPractice.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    EmailModule,
    StorageModule,
    AuthModule,
    AdminModule,
    UserModule,
    ExamIntakeModule,
    QuestionCategoryModule,
    QuestionModule,
    QuestionBankPracticeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
