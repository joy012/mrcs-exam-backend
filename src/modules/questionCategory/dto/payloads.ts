import { QuestionCategoryType } from '@prisma/client';
import { tags } from 'typia';

export interface CreateQuestionCategoryDto {
  /** Display name for the question category */
  displayName: string & tags.MinLength<1>;
  /** Type of question category */
  type: QuestionCategoryType;
}

export interface UpdateQuestionCategoryDto {
  /** Display name for the question category */
  displayName?: string & tags.MinLength<1>;
  /** Whether the category is active */
  isActive?: boolean;
}
