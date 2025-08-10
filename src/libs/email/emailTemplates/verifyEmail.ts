import { renderLayout } from './layout';
import type { EmailTemplate } from './types';

export const verifyEmailTemplate: EmailTemplate = (params) => {
  const { brandName, frontendUrl } = params;
  const email = String(params['email'] ?? '');
  const token = String(params['token'] ?? '');
  const url = `${frontendUrl.replace(/\/$/, '')}/verify-email?email=${encodeURIComponent(
    email,
  )}&token=${encodeURIComponent(token)}`;
  const body = `
    <h2 style="margin:0 0 8px">Verify your email</h2>
    <p>Thanks for signing up for ${brandName}. Please verify your email address to activate your account.</p>
  `;
  return renderLayout({
    title: 'Verify your email',
    bodyHtml: body,
    ctaUrl: url,
    ctaLabel: 'Verify Email',
    brandName: params.brandName,
    brandPrimaryColor: params.brandPrimaryColor,
    brandLogoUrl: params.brandLogoUrl as string | undefined,
    frontendUrl: params.frontendUrl,
  });
};
