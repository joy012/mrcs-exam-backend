import { UserResponse } from 'src/modules/user/dto';
import { tags } from 'typia';

export interface AuthSignupResponse {
  /** Message indicating next steps */
  message: string;
}
export interface AuthLoginResponse {
  accessToken: string & tags.MinLength<1>;
  refreshToken: string & tags.MinLength<1>;
  user: UserResponse;
}

export interface AuthVerifyEmailResponse {
  /** Access token for immediate authentication */
  accessToken: string & tags.MinLength<1>;
  /** Refresh token for immediate authentication */
  refreshToken: string & tags.MinLength<1>;
  /** User data */
  user: UserResponse;
}
