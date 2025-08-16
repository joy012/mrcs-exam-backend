import { UserRole } from '@prisma/client';
import { tags } from 'typia';

export interface UserMeResponse {
  id: string & tags.MinLength<1>;
  firstName: string;
  lastName: string;
  email: string & tags.Format<'email'>;
  role: UserRole;
  isEmailVerified: boolean;
  medicalCollegeName: string;
  phone?: string;
  mmbsPassingYear?: number;
  createdAt: string & tags.Format<'date-time'>;
  updatedAt: string & tags.Format<'date-time'>;
}
