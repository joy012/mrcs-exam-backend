import { renderLayout } from './layout';
import type { EmailTemplate } from './types';

export const resetPasswordTemplate: EmailTemplate = (params) => {
  const email = String(params['email'] ?? '');
  const token = String(params['token'] ?? '');
  const url = `${params.frontendUrl.replace(/\/$/, '')}/reset-password?email=${encodeURIComponent(
    email,
  )}&token=${encodeURIComponent(token)}`;
  const body = `
    <h2 style="margin:0 0 8px">Reset your password</h2>
    <p>We received a request to reset your password. Click below to choose a new password.</p>
  `;
  return renderLayout({
    title: 'Reset your password',
    bodyHtml: body,
    ctaUrl: url,
    ctaLabel: 'Reset Password',
    brandName: params.brandName,
    brandPrimaryColor: params.brandPrimaryColor,
    brandLogoUrl: params.brandLogoUrl as string | undefined,
    frontendUrl: params.frontendUrl,
  });
};
