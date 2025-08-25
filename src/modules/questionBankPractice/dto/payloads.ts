export interface GetQuestionBankQueryDto {
  page?: number;
  limit?: number;
  year?: string;
  intake?: string;
  categories?: string[];
  note?: 'all' | 'with_note' | 'without_note';
  isCorrect?: 'all' | 'correct' | 'incorrect';
  favorite?: 'all' | 'favorite' | 'not_favorite';
  search?: string;
}

export interface CreateQuestionBankAnswerDto {
  questionId: string;
  userAnswer: string;
}

export interface UpdateQuestionBankNoteDto {
  note: string;
}

export interface ResetQuestionBankDto {
  year?: string;
  intake?: string;
  categories?: string[];
}

export interface ToggleFavoriteDto {
  questionId: string;
}
