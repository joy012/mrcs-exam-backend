import { Img, Section } from '@react-email/components';
import React from 'react';
import { Cta, HighlightBox, Layout, Paragraph, Title } from './_Layout';

export type MarketingEmailProps = {
  brandName: string;
  frontendUrl: string;
  title: string;
  contentHtml: string;
  ctaLabel?: string;
  ctaUrl?: string;
};

// Email-specific styles
const styles = {
  imageSection: {
    marginBottom: '16px',
    textAlign: 'center' as const,
  },
  image: {
    width: '100%',
    borderRadius: '12px',
    maxWidth: '100%',
  },
  contentParagraph: {
    margin: 0,
    color: '#475569',
    fontSize: '16px',
    lineHeight: 1.7,
  },
  stayUpdatedText: {
    color: '#64748b',
    fontSize: '14px',
    fontStyle: 'italic',
    textAlign: 'center' as const,
    margin: '24px 0 0 0',
  },
};

export const MarketingEmail: React.FC<MarketingEmailProps> = ({ brandName, title, contentHtml, ctaLabel, ctaUrl }) => {
  return (
    <Layout previewText={title} brandName={brandName}>
      <Section style={styles.imageSection}>
        <Img
          src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&q=80&auto=format&fit=crop"
          alt="MRCS Learning Update"
          style={styles.image}
        />
      </Section>

      <Title>{title}</Title>

      <HighlightBox>
        <Paragraph style={styles.contentParagraph}>
          <span dangerouslySetInnerHTML={{ __html: contentHtml }} />
        </Paragraph>
      </HighlightBox>

      {ctaUrl && ctaLabel ? (
        <Cta href={ctaUrl} label={ctaLabel} widthPct={50} />
      ) : null}

      <Paragraph style={styles.stayUpdatedText}>
        💡 <strong>Stay updated:</strong> Follow us for the latest MRCS exam tips and practice materials.
      </Paragraph>
    </Layout>
  );
};

// Provide default preview props for the React Email dev server
const MarketingEmailWithPreview = Object.assign(MarketingEmail, {
  PreviewProps: {
    brandName: 'Zero To MRCS',
    frontendUrl: 'http://localhost:3000',
    title: 'Introducing new practice sets',
    contentHtml: '<p>Sharpen your skills with our latest MRCS exam practice sets and detailed explanations.</p>',
    ctaLabel: 'Start practicing',
    ctaUrl: 'http://localhost:3000/practice',
  } as MarketingEmailProps,
});

export default MarketingEmailWithPreview;
