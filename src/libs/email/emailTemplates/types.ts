export type Branding = {
  brandName: string;
  brandPrimaryColor: string;
  brandLogoUrl?: string;
  frontendUrl: string;
};

export type LayoutParams = Branding & {
  title: string;
  bodyHtml: string;
  ctaUrl?: string;
  ctaLabel?: string;
};

export type TemplateParams = Branding & Record<string, unknown>;

export type EmailTemplate = (params: TemplateParams) => string;
