import { tags } from 'typia';

export interface CreateUserDto {
  /** First name */
  firstName: string & tags.MinLength<1>;

  /** Last name */
  lastName: string & tags.MinLength<1>;

  /** Role, defaults to student */
  role: 'student' | 'admin';

  /** Medical college name */
  medicalCollegeName: string & tags.MinLength<1>;

  /** Email */
  email: string & tags.Format<'email'>;

  /** Phone number */
  phone?: string & tags.Pattern<'^[+]?[0-9]{7,15}$'>;

  /** MBBS passing year */
  mmbsPassingYear?: string & tags.Pattern<'^[0-9]+$'>;

  /** Password (min 8 chars) */
  password: string & tags.MinLength<8>;

  /** Avatar URL */
  avatarURL?: string;
}

export interface UpdateUserDto {
  /** First name */
  firstName?: string & tags.MinLength<1>;

  /** Last name */
  lastName?: string & tags.MinLength<1>;

  /** Medical college name */
  medicalCollegeName?: string & tags.MinLength<1>;

  /** E.164-ish phone, 7-15 digits, optional leading + */
  phone?: string & tags.Pattern<'^[+]?[0-9]{7,15}$'>;

  /** MBBS passing year */
  mmbsPassingYear?: number & tags.Minimum<1950> & tags.Maximum<2100>;
}
