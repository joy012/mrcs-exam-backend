import { tags } from 'typia';

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

  /** Avatar URL */
  avatarURL?: string;
}
