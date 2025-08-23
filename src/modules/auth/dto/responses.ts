import { UserResponse } from 'src/modules/user/dto';
import { tags } from 'typia';

export interface SessionResponse {
  id: string;
  deviceName: string;
  userAgent?: string;
  ipAddress?: string;
  status: 'ACTIVE' | 'TERMINATED';
  createdAt: string;
  lastSeenAt: string;
  revokedAt?: string;
}

export interface AuthSignupResponse {
  /** Message indicating next steps */
  message: string;
}

export interface AuthLoginResponse {
  accessToken: string & tags.MinLength<1>;
  refreshToken: string & tags.MinLength<1>;
  user: UserResponse;
  sessions: SessionResponse[];
}

export interface AuthVerifyEmailResponse {
  /** Access token for immediate authentication */
  accessToken: string & tags.MinLength<1>;
  /** Refresh token for immediate authentication */
  refreshToken: string & tags.MinLength<1>;
  /** User data */
  user: UserResponse;
  sessions: SessionResponse[];
}

export interface CreateSessionResponse {
  session: SessionResponse;
  sessions: SessionResponse[];
}

export interface LogoutResponse {
  message: string;
}

export interface TerminateAllSessionsResponse {
  message: string;
  terminatedCount: number;
}
