import { UserResponse } from 'src/modules/user/dto';
import { tags } from 'typia';

export interface AuthSignupResponse {
  /** Created user ID */
  userId: string & tags.MinLength<1>;
}

export interface AuthLoginResponse {
  accessToken: string & tags.MinLength<1>;
  refreshToken: string & tags.MinLength<1>;
  user: UserResponse;
}
