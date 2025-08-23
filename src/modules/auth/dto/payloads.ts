import { tags } from 'typia';

export interface SessionInfoDto {
  /** Human friendly device name, e.g. "MacBook Pro - Chrome" */
  deviceName: string & tags.MinLength<1>;
  /** Full user agent string */
  userAgent?: string;
  /** Optional public IP detected client-side; server may override from request */
  ipAddress?: string;
}

export interface AuthSignupDto {
  /** Email */
  email: string & tags.Format<'email'>;
}

export interface AuthCompleteProfileDto {
  /** First name */
  firstName: string & tags.MinLength<1>;

  /** Last name */
  lastName: string & tags.MinLength<1>;

  /** Role, defaults to student */
  role?: 'student' | 'admin';

  /** Medical college name */
  medicalCollegeName: string & tags.MinLength<1>;

  /** E.164-ish phone, 7-15 digits, optional leading + */
  phone?: string;

  /** MBBS passing year */
  mmbsPassingYear?: number & tags.Minimum<1950> & tags.Maximum<2100>;

  /** Password (min 8 chars) */
  password: string & tags.MinLength<8>;

  /** Email for verification */
  email: string & tags.Format<'email'>;
}

export interface AuthLoginDto {
  /** Email */
  email: string & tags.Format<'email'>;
  /** Password */
  password: string & tags.MinLength<8>;
  /** Session info for this login attempt */
  session?: SessionInfoDto;
}

export interface AuthVerifyEmailDto {
  /** Email */
  email: string & tags.Format<'email'>;
  /** Verification token */
  token: string & tags.MinLength<16>;
  /** Session info to establish after verification */
  session?: SessionInfoDto;
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

export interface RefreshTokenBody {
  refreshToken: string;
}

export interface AuthResendVerificationEmailDto {
  /** Email */
  email: string & tags.Format<'email'>;
}

export interface AuthResendForgotPasswordEmailDto {
  /** Email */
  email: string & tags.Format<'email'>;
}

/** Create a session for already logged-in users with no active session */
export interface CreateSessionDto {
  session: SessionInfoDto;
}
