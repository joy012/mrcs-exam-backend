import { Button, Heading, Hr, Link, Section, Text } from '@react-email/components';
import React from 'react';
import { Layout } from './_Layout';

export type ResetPasswordProps = {
  brandName: string;
  frontendUrl: string;
  email: string;
  token: string;
};

// Email-specific styles
const styles = {
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
  warningText: {
    color: '#64748b',
    fontSize: '14px',
    fontStyle: 'italic',
    margin: '20px 0 0 0',
  },
  lowerSection: {
    padding: '15x',
    marginTop: '10px',
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

export const ResetPassword: React.FC<ResetPasswordProps> = ({ brandName, frontendUrl, email, token }) => {
  const baseUrl = frontendUrl || 'http://localhost:3000';
  const url = `${baseUrl.replace(/\/$/, '')}/reset-password?email=${encodeURIComponent(email || 'user@example.com')}&token=${encodeURIComponent(token || 'token')}`;

  return (
    <Layout previewText={`Reset your password for ${brandName}`} brandName={brandName}>
      <Heading style={styles.h1}>Reset your password</Heading>
      <Text style={styles.mainText}>
        We received a request to reset your password for your {brandName} account. Click the button below to choose a new secure password.
      </Text>

      <Section style={styles.highlightBox}>
        <Text style={styles.highlightTitle}>
          🔐 <strong>Security reminder:</strong>
        </Text>
        <Text style={styles.highlightSubtitle}>
          Choose a strong password that you haven't used elsewhere.
        </Text>
      </Section>

      <Text style={styles.warningText}>
        ⚠️ <strong>Important:</strong> If you didn't request this password reset, you can safely ignore this email. Your current password will remain unchanged.
      </Text>

      <div style={{ textAlign: 'center' as const }}>
        <Button href={url} style={styles.ctaButton}>
          Reset Password
        </Button>
      </div>

      <Hr />

      <Section style={styles.lowerSection}>
        <Text style={styles.cautionText}>
          If the button doesn't work, you can also copy and paste this link into your browser: <br /> <Link href={url} style={styles.link}>{url}</Link>
        </Text>
      </Section>
    </Layout>
  );
};

// Provide default preview props for the React Email dev server
const ResetPasswordWithPreview = Object.assign(ResetPassword, {
  PreviewProps: {
    brandName: 'Zero To MRCS',
    frontendUrl: 'http://localhost:3000',
    email: 'user@example.com',
    token: 'abcdef123456',
  } as ResetPasswordProps,
});

export default ResetPasswordWithPreview;
