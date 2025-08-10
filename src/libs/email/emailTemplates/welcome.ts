import { renderLayout } from './layout';
import type { EmailTemplate } from './types';

export const welcomeTemplate: EmailTemplate = (params) => {
  const firstName = String(params['firstName'] ?? '').trim();
  const name = firstName ? `, ${firstName}` : '';
  const body = `
    <h2 style="margin:0 0 8px">Welcome${name} 👋</h2>
    <p>Your email is verified and your account is all set. We're excited to have you on board.</p>
    <p class="muted">Tip: You can manage your profile and settings anytime from your dashboard.</p>
  `;
  return renderLayout({
    title: 'Welcome aboard',
    bodyHtml: body,
    ctaUrl: params.frontendUrl.replace(/\/$/, ''),
    ctaLabel: 'Go to Dashboard',
    brandName: params.brandName,
    brandPrimaryColor: params.brandPrimaryColor,
    brandLogoUrl: params.brandLogoUrl as string | undefined,
    frontendUrl: params.frontendUrl,
  });
};
