import { ExamIntake, Question, QuestionCategory } from '@prisma/client';

export type QuestionResponse = Omit<Question, 'intake' | 'categories'> & {
  intake: Pick<ExamIntake, 'id' | 'displayName'>;
  categories: Pick<QuestionCategory, 'id' | 'displayName'>[];
};

export interface QuestionsListResponse {
  questions: QuestionResponse[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export interface CreateQuestionResponse {
  message: string;
}

export interface UpdateQuestionResponse {
  message: string;
}

export interface DeleteQuestionResponse {
  message: string;
}

export interface LockQuestionResponse {
  message: string;
}
