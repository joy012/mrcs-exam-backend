import type { LayoutParams } from './types';

export function renderLayout({
  title,
  bodyHtml,
  ctaUrl,
  ctaLabel,
  brandName,
  brandPrimaryColor,
  brandLogoUrl,
}: LayoutParams): string {
  const brandColor = brandPrimaryColor || '#635bff';
  return `
<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>${title}</title>
    <style>
      @media (prefers-color-scheme: dark) {
        body { background-color: #0b1220 !important; color: #e2e8f0 !important; }
        .card { background:#111827 !important; border-color:#1f2937 !important; }
        .muted { color:#94a3b8 !important; }
        a { color: ${brandColor}; }
      }
      body { background-color: #f6f9fc; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#0f172a; }
      .container { max-width: 640px; margin: 0 auto; padding: 24px; }
      .card { background:#ffffff; border:1px solid #eef2f7; border-radius: 12px; box-shadow: 0 10px 25px rgba(50,50,93,.05), 0 8px 10px rgba(0,0,0,.04); overflow: hidden; }
      .header { display:flex; align-items:center; gap:12px; padding: 20px 24px; border-bottom: 1px solid #eef2f7; }
      .logo { height: 28px; }
      .brand { font-weight: 700; letter-spacing: -0.01em; }
      .content { padding: 24px; line-height: 1.6; }
      .cta { display:inline-block; background:${brandColor}; color:#ffffff !important; text-decoration:none; padding:12px 18px; border-radius:10px; font-weight:600; }
      .muted { color:#64748b; font-size: 13px; }
      .footer { text-align:center; padding: 18px 12px; color:#94a3b8; font-size:12px; }
      a { color: ${brandColor}; }
      h1,h2 { letter-spacing: -0.01em; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="card">
        <div class="header">
          ${brandLogoUrl ? `<img src="${brandLogoUrl}" alt="${brandName}" class="logo" />` : ''}
          <span class="brand">${brandName}</span>
        </div>
        <div class="content">
          ${bodyHtml}
          ${ctaUrl && ctaLabel ? `<p style="margin-top:24px"><a href="${ctaUrl}" class="cta">${ctaLabel}</a></p>` : ''}
          ${ctaUrl ? `<p class="muted" style="margin-top:16px">If the button does not work, paste this URL into your browser:<br/><span>${ctaUrl}</span></p>` : ''}
        </div>
      </div>
      <div class="footer">© ${new Date().getFullYear()} ${brandName}. All rights reserved.</div>
    </div>
  </body>
 </html>`;
}
