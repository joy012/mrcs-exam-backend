import { Img, Section } from '@react-email/components';
import React from 'react';
import { Cta, HighlightBox, Layout, Paragraph, Title } from './_Layout';

export type WelcomeEmailProps = {
  brandName: string;
  frontendUrl: string;
  firstName?: string;
};

// Email-specific styles
const styles = {
  imageSection: {
    marginBottom: '12px',
    textAlign: 'center' as const,
  },
  image: {
    width: '100%',
    borderRadius: '12px',
    maxWidth: '100%',
  },
  highlightTitle: {
    margin: '0 0 8px 0',
    textAlign: 'center' as const,
    color: '#334155',
    fontWeight: '600',
    fontSize: '16px',
  },
  highlightSubtitle: {
    margin: 0,
    textAlign: 'center' as const,
    color: '#8b5cf6',
    fontSize: '14px',
    fontWeight: '500',
  },
  featureList: {
    listStyle: 'none' as const,
    padding: 0,
    margin: '12px 0 0 0',
    textAlign: 'center' as const,
  },
  featureItem: {
    margin: '6px 0',
    color: '#8b5cf6',
    fontSize: '14px',
  },
  proTip: {
    color: '#64748b',
    fontSize: '14px',
    fontStyle: 'italic',
    margin: '20px 0 0 0',
  },
};

export const WelcomeEmail: React.FC<WelcomeEmailProps> = ({ brandName, frontendUrl, firstName }) => {
  const nameSuffix = firstName?.trim() ? `, ${firstName.trim()}` : '';
  const dashboardUrl = frontendUrl.replace(/\/$/, '');
  return (
    <Layout previewText={`Welcome to ${brandName}`} brandName={brandName}>
      <Section style={styles.imageSection}>
        <Img
          src="https://images.unsplash.com/photo-1529336953121-ad5a5f9bcd4b?w=1200&q=80&auto=format&fit=crop"
          alt="Welcome to MRCS Journey"
          style={styles.image}
        />
      </Section>

      <Title>Welcome{nameSuffix} 👋</Title>
      <Paragraph>
        We're thrilled to have you join {brandName}. Your account is now active and ready to help you excel in your MRCS journey.
      </Paragraph>

      <HighlightBox>
        <div style={styles.highlightTitle}>
          🚀 <strong>What's next?</strong>
        </div>
        <div style={styles.highlightSubtitle}>
          Start exploring your personalized learning experience:
        </div>
        <ul style={styles.featureList}>
          <li style={styles.featureItem}>✓ Access practice exams & questions</li>
          <li style={styles.featureItem}>✓ Track your progress</li>
          <li style={styles.featureItem}>✓ View performance analytics</li>
        </ul>
      </HighlightBox>

      <Paragraph style={styles.proTip}>
        💡 <strong>Pro tip:</strong> You can manage your profile and settings anytime from your dashboard.
      </Paragraph>

      <Cta href={dashboardUrl} label="Go to Dashboard" widthPct={50} />
    </Layout>
  );
};

// Provide default preview props for the React Email dev server
const WelcomeEmailWithPreview = Object.assign(WelcomeEmail, {
  PreviewProps: {
    brandName: 'Zero To MRCS',
    frontendUrl: 'http://localhost:3000',
    firstName: 'Alex',
  } as WelcomeEmailProps,
});

export default WelcomeEmailWithPreview;
