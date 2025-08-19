import { Button, Heading, Hr, Img, Link, Section, Text } from '@react-email/components';
import React from 'react';
import { Layout } from './_Layout';

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
  mainText: {
    color: '#333',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
    fontSize: '14px',
    marginBottom: '14px',
    lineHeight: 1.6,
  },
  highlightBox: {
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '20px',
    margin: '20px 0',
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
    color: '#7c3aed',
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
    color: '#7c3aed',
    fontSize: '14px',
  },
  proTip: {
    color: '#64748b',
    fontSize: '14px',
    fontStyle: 'italic',
    margin: '20px 0 0 0',
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
  link: {
    color: '#7c3aed',
    textDecoration: 'underline',
  },
};

export const WelcomeEmail: React.FC<WelcomeEmailProps> = ({ brandName, frontendUrl, firstName }) => {
  const nameSuffix = firstName?.trim() ? `, ${firstName.trim()}` : '';
  const dashboardUrl = frontendUrl ? frontendUrl.replace(/\/$/, '') : 'http://localhost:3000';

  return (
    <Layout previewText={`Welcome to ${brandName}`} brandName={brandName}>
      <Section style={styles.imageSection}>
        <Img
          src="https://images.unsplash.com/photo-1529336953121-ad5a5f9bcd4b?w=1200&q=80&auto=format&fit=crop"
          alt="Welcome to MRCS Journey"
          style={styles.image}
        />
      </Section>

      <Heading style={styles.h1}>Welcome{nameSuffix} 👋</Heading>
      <Text style={styles.mainText}>
        We're thrilled to have you join {brandName}. Your account is now active and ready to help you excel in your MRCS journey.
      </Text>

      <Section style={styles.highlightBox}>
        <Text style={styles.highlightTitle}>
          🚀 <strong>What's next?</strong>
        </Text>
        <Text style={styles.highlightSubtitle}>
          Start exploring your personalized learning experience:
        </Text>
        <ul style={styles.featureList}>
          <li style={styles.featureItem}>✓ Access practice exams & questions</li>
          <li style={styles.featureItem}>✓ Track your progress</li>
          <li style={styles.featureItem}>✓ View performance analytics</li>
        </ul>
      </Section>

      <Text style={styles.proTip}>
        💡 <strong>Pro tip:</strong> You can manage your profile and settings anytime from your dashboard.
      </Text>

      <div style={{ textAlign: 'center' as const }}>
        <Button href={dashboardUrl} style={styles.ctaButton}>
          Go to Dashboard
        </Button>
      </div>

      <Hr />

      <Section style={styles.lowerSection}>
        <Text style={styles.cautionText}>
          Ready to start your MRCS journey? Click the button above to access your personalized dashboard or visit <Link href={dashboardUrl} style={styles.link}>{dashboardUrl}</Link>
        </Text>
      </Section>
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
