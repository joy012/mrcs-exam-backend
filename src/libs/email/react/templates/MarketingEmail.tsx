import { Button, Heading, Hr, Img, Section, Text } from '@react-email/components';
import React from 'react';
import { Layout } from './_Layout';

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
    borderRadius: '8px',
    maxWidth: '100%',
  },
  h1: {
    color: '#333',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '15px',
  },
  contentParagraph: {
    margin: 0,
    color: '#475569',
    fontSize: '16px',
    lineHeight: 1.7,
  },
  highlightBox: {
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '20px',
    margin: '20px 0',
  },
  stayUpdatedText: {
    color: '#64748b',
    fontSize: '14px',
    fontStyle: 'italic',
    textAlign: 'center' as const,
    margin: '24px 0 0 0',
  },
  lowerSection: {
    padding: '25px 35px',
    marginTop: '20px',
  },
  cautionText: {
    color: '#333',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
    fontSize: '14px',
    margin: '0px',
    lineHeight: 1.6,
  },
  ctaButton: {
    display: 'inline-block',
    background: '#7c3aed',
    color: 'white',
    textDecoration: 'none',
    fontWeight: '600',
    padding: '16px 32px',
    borderRadius: '8px',
    fontSize: '16px',
    textAlign: 'center' as const,
    border: 'none',
    minWidth: '200px',
    maxWidth: '280px',
    margin: '20px 0',
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

      <Heading style={styles.h1}>{title}</Heading>

      <Section style={styles.highlightBox}>
        <Text style={styles.contentParagraph}>
          <span dangerouslySetInnerHTML={{ __html: contentHtml }} />
        </Text>
      </Section>

      {ctaUrl && ctaLabel ? (
        <div style={{ textAlign: 'center' as const }}>
          <Button href={ctaUrl} style={styles.ctaButton}>
            {ctaLabel}
          </Button>
        </div>
      ) : null}

      <Text style={styles.stayUpdatedText}>
        💡 <strong>Stay updated:</strong> Follow us for the latest MRCS exam tips and practice materials.
      </Text>

      <Hr />

      <Section style={styles.lowerSection}>
        <Text style={styles.cautionText}>
          Keep learning and improving your MRCS exam skills with our comprehensive practice materials. Visit our platform for more resources.
        </Text>
      </Section>
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
