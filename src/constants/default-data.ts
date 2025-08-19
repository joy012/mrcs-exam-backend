import { ExamIntakeType, QuestionCategoryType } from '@prisma/client';

export const DEFAULT_EXAM_INTAKES = [
  {
    type: ExamIntakeType.JANUARY,
    displayName: 'January',
    isActive: true,
    isDefault: true,
  },
  {
    type: ExamIntakeType.APRIL_MAY,
    displayName: 'April/May',
    isActive: true,
    isDefault: true,
  },
  {
    type: ExamIntakeType.SEPTEMBER,
    displayName: 'September',
    isActive: true,
    isDefault: true,
  },
];

export const DEFAULT_QUESTION_CATEGORIES = [
  {
    displayName: 'Basic Anatomy - Thorax',
    type: QuestionCategoryType.BASIC,
    isActive: true,
    isDefault: true,
  },
  {
    displayName: 'Basic Anatomy - Abdomen',
    type: QuestionCategoryType.BASIC,
    isActive: true,
    isDefault: true,
  },
  {
    displayName: 'Basic Anatomy - Superior Extremity',
    type: QuestionCategoryType.BASIC,
    isActive: true,
    isDefault: true,
  },
  {
    displayName: 'Basic Anatomy - Inferior Extremity',
    type: QuestionCategoryType.BASIC,
    isActive: true,
    isDefault: true,
  },
  {
    displayName: 'Basic Anatomy - Head, Neck & Brain',
    type: QuestionCategoryType.BASIC,
    isActive: true,
    isDefault: true,
  },
  {
    displayName: 'Basic Physiology',
    type: QuestionCategoryType.BASIC,
    isActive: true,
    isDefault: true,
  },
  {
    displayName: 'Basic Pathology',
    type: QuestionCategoryType.BASIC,
    isActive: true,
    isDefault: true,
  },
  {
    displayName: 'Basic Microbiology',
    type: QuestionCategoryType.BASIC,
    isActive: true,
    isDefault: true,
  },
  {
    displayName: 'Basic Biostatistics',
    type: QuestionCategoryType.BASIC,
    isActive: true,
    isDefault: true,
  },
  {
    displayName: 'Clinical GIT, Colorectal & Abdomen',
    type: QuestionCategoryType.CLINICAL,
    isActive: true,
    isDefault: true,
  },
  {
    displayName: 'Clinical Hepatobiliary & Pancreas',
    type: QuestionCategoryType.CLINICAL,
    isActive: true,
    isDefault: true,
  },
  {
    displayName: 'Clinical Urology',
    type: QuestionCategoryType.CLINICAL,
    isActive: true,
    isDefault: true,
  },
  {
    displayName: 'Clinical Orthopedics',
    type: QuestionCategoryType.CLINICAL,
    isActive: true,
    isDefault: true,
  },
  {
    displayName: 'Clinical Breast & Endocrine',
    type: QuestionCategoryType.CLINICAL,
    isActive: true,
    isDefault: true,
  },
  {
    displayName: 'Clinical ENT',
    type: QuestionCategoryType.CLINICAL,
    isActive: true,
    isDefault: true,
  },
  {
    displayName: 'Clinical Skin',
    type: QuestionCategoryType.CLINICAL,
    isActive: true,
    isDefault: true,
  },
  {
    displayName: 'Clinical Vascular Surgery',
    type: QuestionCategoryType.CLINICAL,
    isActive: true,
    isDefault: true,
  },
  {
    displayName: 'Clinical Neurosurgery',
    type: QuestionCategoryType.CLINICAL,
    isActive: true,
    isDefault: true,
  },
  {
    displayName: 'Clinical Organ Transplantation',
    type: QuestionCategoryType.CLINICAL,
    isActive: true,
    isDefault: true,
  },
  {
    displayName: 'Clinical Pediatric Surgery',
    type: QuestionCategoryType.CLINICAL,
    isActive: true,
    isDefault: true,
  },
  {
    displayName: 'Clinical Perioperative care',
    type: QuestionCategoryType.CLINICAL,
    isActive: true,
    isDefault: true,
  },
  {
    displayName: 'Clinical Post operative care',
    type: QuestionCategoryType.CLINICAL,
    isActive: true,
    isDefault: true,
  },
  {
    displayName: 'Clinical Surgical Emergency & Trauma',
    type: QuestionCategoryType.CLINICAL,
    isActive: true,
    isDefault: true,
  },
];
