export interface GetAllQuestionsQueryDto {
  page?: number;
  limit?: number;
  year?: string;
  intake?: string;
  categories?: string[];
  search?: string;
  sourceFile?: string;
}

export interface CreateQuestionDto {
  mainQuestion: string;
  intake: string;
  categories: string[];
  explanation?: string;
  description?: string;
  year: string;
  correctAnswer: string;
  options: Record<string, string>;
  sourceFile?: string;
}

export interface UpdateQuestionDto {
  mainQuestion?: string;
  year?: string;
  intake?: string;
  categories?: string[];
  explanation?: string;
  description?: string;
  correctAnswer?: string;
  options?: Record<string, string>;
  sourceFile?: string;
}

export interface QuestionFiltersResponse {
  intakes: Array<{ id: string; displayName: string }>;
  categories: Array<{ id: string; displayName: string }>;
  years: string[];
  sourceFiles: string[];
}
