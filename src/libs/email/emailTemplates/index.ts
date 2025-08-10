import { resetPasswordTemplate } from './resetPassword';
import { EmailTemplate } from './types';
import { verifyEmailTemplate } from './verifyEmail';
import { welcomeTemplate } from './welcome';

export const templates: Record<string, EmailTemplate> = {
  'verify-email': (params) => verifyEmailTemplate(params),
  'reset-password': (params) => resetPasswordTemplate(params),
  welcome: (params) => welcomeTemplate(params),
};
