import { Img, Section } from '@react-email/components';
import React from 'react';
import { Cta, Layout, Paragraph, Title } from './_Layout';

export type MarketingEmailProps = {
  brandName: string;
  brandPrimaryColor: string;
  brandLogoUrl?: string;
  frontendUrl: string;
  title: string;
  contentHtml: string;
  ctaLabel?: string;
  ctaUrl?: string;
};

export const MarketingEmail: React.FC<MarketingEmailProps> = ({ brandName, brandPrimaryColor, brandLogoUrl, title, contentHtml, ctaLabel, ctaUrl }) => {
  return (
    <Layout previewText={title} brandName={brandName} brandPrimaryColor={brandPrimaryColor} brandLogoUrl={brandLogoUrl}>
      <Section className="mb-4" style={{ textAlign: 'center' }}>
        <Img src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&q=80&auto=format&fit=crop" alt="Announcement" className="w-full rounded-lg" />
      </Section>
      <Title>{title}</Title>
      <Paragraph className="text-slate-600">
        <span dangerouslySetInnerHTML={{ __html: contentHtml }} />
      </Paragraph>
      {ctaUrl && ctaLabel ? <Cta href={ctaUrl} label={ctaLabel} brandPrimaryColor={brandPrimaryColor} /> : null}
    </Layout>
  );
};

// Provide default preview props for the React Email dev server
const MarketingEmailWithPreview = Object.assign(MarketingEmail, {
  PreviewProps: {
    brandName: 'MRCS Exam',
    brandPrimaryColor: '#2563eb',
    brandLogoUrl: 'https://dummyimage.com/112x28/2563eb/ffffff&text=MRCS',
    frontendUrl: 'http://localhost:3000',
    title: 'Introducing new practice sets',
    contentHtml: '<p>Sharpen your skills with our latest MRCS exam practice sets and explanations.</p>',
    ctaLabel: 'Start practicing',
    ctaUrl: 'http://localhost:3000/practice',
  } as MarketingEmailProps,
});

export default MarketingEmailWithPreview;
