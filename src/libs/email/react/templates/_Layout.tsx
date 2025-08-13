import { Body, Button, Container, Head, Heading, Hr, Html, Img, Preview, Section, Tailwind, Text } from '@react-email/components';
import React from 'react';

export type LayoutProps = {
  previewText?: string;
  brandName: string;
  brandPrimaryColor: string;
  brandLogoUrl?: string;
  children: React.ReactNode;
};

export const Layout: React.FC<LayoutProps> = ({ previewText, brandName, brandPrimaryColor, brandLogoUrl, children }) => {
  const darkenHexColor = (hex: string, percent: number): string => {
    const safeHex = hex.replace('#', '');
    const bigint = parseInt(safeHex.length === 3 ? safeHex.split('').map((c) => c + c).join('') : safeHex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    const adjust = (c: number) => Math.max(0, Math.min(255, Math.round(c * (1 - percent / 100))));
    const rr = adjust(r).toString(16).padStart(2, '0');
    const gg = adjust(g).toString(16).padStart(2, '0');
    const bb = adjust(b).toString(16).padStart(2, '0');
    return `#${rr}${gg}${bb}`;
  };

  const headerGradientEnd = darkenHexColor(brandPrimaryColor, 12);
  return (
    <Html>
      <Head>
        {/* Viewport for mobile scaling */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Google Fonts (many clients gracefully fall back if unsupported) */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* Basic link styling in all templates */}
        <style>
          {`a { color: ${brandPrimaryColor}; text-decoration: underline; }
            img { max-width: 100% !important; height: auto !important; display: block; }
          `}
        </style>
      </Head>
      {previewText ? <Preview>{previewText}</Preview> : null}
      <Tailwind>
        <Body
          className="bg-[#f5f7fb] text-slate-900"
          style={{
            fontFamily: 'Inter, -apple-system, Segoe UI, Roboto, Arial, Helvetica, sans-serif',
            backgroundImage: 'linear-gradient(180deg, #f7f9fc 0%, #eef2f7 100%)',
          }}
        >
          <Container className="mx-auto my-0 max-w-[640px] p-6">
            {/* Card */}
            <Section className="bg-white border border-slate-100 rounded-2xl shadow-[0_12px_30px_rgba(17,24,39,.06)] overflow-hidden">
              {/* Killer branded header */}
              <Section
                className="px-6 pt-7 pb-7"
                style={{
                  backgroundColor: brandPrimaryColor,
                  backgroundImage: `linear-gradient(90deg, ${brandPrimaryColor}, ${headerGradientEnd})`,
                  textAlign: 'center',
                }}
              >
                {brandLogoUrl ? (
                  <Img
                    src={brandLogoUrl}
                    alt={brandName}
                    style={{ display: 'block', margin: '0 auto', height: 28 }}
                  />
                ) : null}
                <Heading as="h3" className="!m-0 text-white text-[20px] font-semibold tracking-tight mt-3">
                  {brandName}
                </Heading>
              </Section>
              <Section className="px-6 pt-5 pb-2">
                <Hr className="border-slate-100" />
              </Section>

              {/* Content */}
              <Section className="px-6 pb-6 leading-relaxed">
                {children}
              </Section>

              {/* Footer */}
              <Section className="text-center px-6 pb-6 text-slate-500 text-xs">
                © {new Date().getFullYear()} {brandName}. All rights reserved.
              </Section>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export const Cta: React.FC<{ href: string; label: string; brandPrimaryColor: string; widthPct?: number }> = ({ href, label, brandPrimaryColor, widthPct }) => (
  <Section className="text-center my-3">
    <Button
      href={href}
      className="inline-block no-underline text-white font-semibold px-4 py-3 rounded-lg text-[15px] shadow-[0_6px_14px_rgba(37,99,235,.35)]"
      style={{ backgroundColor: brandPrimaryColor, width: widthPct ? `${Math.max(10, Math.min(100, widthPct))}%` : undefined }}
    >
      {label}
    </Button>
  </Section>
);

export const Paragraph: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className }) => (
  <Text className={`text-slate-700 text-[15px] leading-7 ${className ?? ''}`.trim()}>{children}</Text>
);

export const Title: React.FC<React.PropsWithChildren> = ({ children }) => (
  <Heading as="h2" className="!m-0 mb-3 tracking-tight text-[20px] font-bold">
    {children}
  </Heading>
);


