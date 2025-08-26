export interface QuestionBankItemResponse {
  id: string;
  question: string;
  options: Record<string, string>;
  correctAnswer: string;
  explanation: string;
  year: string;
  intake: {
    id: string;
    displayName: string;
  };
  categories: Array<{
    id: string;
    displayName: string;
    type: string;
  }>;
  userAnswer?: string;
  note?: string;
  isCorrect?: boolean;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuestionBankListResponse {
  questions: QuestionBankItemResponse[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export interface QuestionBankStatsResponse {
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  questionsWithNotes: number;
  accuracy: number;
}

export interface QuestionBankFiltersResponse {
  intakes: Array<{
    id: string;
    displayName: string;
  }>;
  categories: Array<{
    id: string;
    displayName: string;
    type: string;
  }>;
  years: string[];
}
