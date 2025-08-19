import { Question } from '@prisma/client';

export interface QuestionsListResponse {
  questions: Question[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}
