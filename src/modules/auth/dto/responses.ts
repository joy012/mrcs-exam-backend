import { UserResponse } from 'src/modules/user/dto';
import { tags } from 'typia';

export interface AuthSignupResponse {
  /** Access token for immediate authentication */
  accessToken: string & tags.MinLength<1>;
  /** Refresh token for immediate authentication */
  refreshToken: string & tags.MinLength<1>;
  /** User data */
  user: UserResponse;
  /** Message indicating next steps */
  message: string;
}

export interface AuthCompleteProfileResponse {
  accessToken: string & tags.MinLength<1>;
  refreshToken: string & tags.MinLength<1>;
  user: UserResponse;
}

export interface AuthLoginResponse extends AuthCompleteProfileResponse {
  /** Indicates if profile completion is required */
  requiresProfileCompletion?: boolean;
}
