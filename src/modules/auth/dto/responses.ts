import { tags } from 'typia';

export interface AuthSignupResponse {
  /** Created user ID */
  userId: string & tags.MinLength<1>;
}

export interface AuthLoginResponseUser {
  id: string & tags.MinLength<1>;
  firstName: string;
  lastName: string;
  email: string & tags.Format<'email'>;
  role: 'student' | 'admin';
  isEmailVerified: boolean;
  avatarURL?: string;
}

export interface AuthLoginResponse {
  accessToken: string & tags.MinLength<1>;
  refreshToken: string & tags.MinLength<1>;
  user: AuthLoginResponseUser;
}

export type EmptyResponse = Record<string, never>;
