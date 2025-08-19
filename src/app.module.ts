import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './libs/config/config.module';
import { EmailModule } from './libs/email/email.module';
import { PrismaModule } from './libs/prisma/prisma.module';
import { AdminModule } from './modules/admin/admin.module';
import { AuthModule } from './modules/auth/auth.module';
import { ExamIntakeModule } from './modules/examIntake/examIntake.module';
import { QuestionCategoryModule } from './modules/questionCategory/questionCategory.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    EmailModule,
    AuthModule,
    AdminModule,
    UserModule,
    ExamIntakeModule,
    QuestionCategoryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
