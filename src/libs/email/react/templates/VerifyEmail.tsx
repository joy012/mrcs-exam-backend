import React from 'react';
import { Cta, Layout, Paragraph, Subtitle, Title } from './_Layout';

export type VerifyEmailProps = {
  brandName: string;
  frontendUrl: string;
  email: string;
  token: string;
};

// Email-specific styles
const styles = {
  fallbackText: {
    textAlign: 'center' as const,
    color: '#64748b',
    fontSize: '14px',
    margin: '20px 0 0 0',
  },
  fallbackLink: {
    color: '#8b5cf6',
    textDecoration: 'underline',
    wordBreak: 'break-all' as const,
    fontSize: '12px',
  },
};

export const VerifyEmail: React.FC<VerifyEmailProps> = ({ brandName, frontendUrl, email, token }) => {
  const verifyUrl = `${frontendUrl.replace(/\/$/, '')}/verify-email?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`;
  return (
    <Layout previewText={`Verify your email for ${brandName}`} brandName={brandName}>
      <Title>Verify your email</Title>
      <Subtitle>Welcome to your MRCS journey!</Subtitle>

      <Paragraph>
        Thanks for signing up for {brandName}. Please confirm your email address to activate your account and start exploring your personalized dashboard.
      </Paragraph>

      <Cta href={verifyUrl} label="Verify Email" widthPct={50} />

      <Paragraph style={styles.fallbackText}>
        If the button doesn't work, you can also copy and paste this link into your browser:
        <br />
        <a href={verifyUrl} style={styles.fallbackLink}>
          {verifyUrl}
        </a>
      </Paragraph>
    </Layout>
  );
};

// Provide default preview props for the React Email dev server
const VerifyEmailWithPreview = Object.assign(VerifyEmail, {
  PreviewProps: {
    brandName: 'Zero To MRCS',
    frontendUrl: 'http://localhost:3000',
    email: 'user@example.com',
    token: 'abcdef123456',
  } as VerifyEmailProps,
});

export default VerifyEmailWithPreview;
