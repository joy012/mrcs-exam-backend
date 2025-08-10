import { tags } from 'typia';

export interface AuthSignupDto {
  /** First name */
  firstName: string & tags.MinLength<1>;

  /** Last name */
  lastName: string & tags.MinLength<1>;

  /** Role, defaults to student */
  role?: 'student' | 'admin';

  /** Medical college name */
  medicalCollegeName: string & tags.MinLength<1>;

  /** Email */
  email: string & tags.Format<'email'>;

  /** E.164-ish phone, 7-15 digits, optional leading + */
  phone?: string & tags.Pattern<'^[+]?[0-9]{7,15}$'>;

  /** MBBS passing year */
  mmbsPassingYear?: number & tags.Minimum<1950> & tags.Maximum<2100>;

  /** Password (min 8 chars) */
  password: string & tags.MinLength<8>;
}

export interface AuthLoginDto {
  /** Email */
  email: string & tags.Format<'email'>;
  /** Password */
  password: string & tags.MinLength<8>;
}

export interface AuthVerifyEmailDto {
  /** Email */
  email: string & tags.Format<'email'>;
  /** Verification token */
  token: string & tags.MinLength<16>;
}

export interface AuthSendForgotPasswordDto {
  /** Email */
  email: string & tags.Format<'email'>;
}

export interface AuthResetPasswordDto {
  /** Email */
  email: string & tags.Format<'email'>;
  /** Reset token */
  token: string & tags.MinLength<16>;
  /** New password */
  newPassword: string & tags.MinLength<8>;
}
