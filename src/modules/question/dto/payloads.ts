export interface GetAllQuestionsQueryDto {
  page?: number;
  limit?: number;
  year?: number;
  intakeId?: string;
  categoryIds?: string[];
  search?: string;
  sourceFile?: string;
}
