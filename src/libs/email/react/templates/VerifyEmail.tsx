import { Button, Heading, Hr, Link, Section, Text } from '@react-email/components';
import React from 'react';
import { Layout } from './_Layout';

export type VerifyEmailProps = {
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
  lowerSection: {
    padding: '15px',
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

export const VerifyEmail: React.FC<VerifyEmailProps> = ({ brandName, frontendUrl, email, token }) => {
  const baseUrl = frontendUrl || 'http://localhost:3000';
  const verifyUrl = `${baseUrl.replace(/\/$/, '')}/verify-email?email=${encodeURIComponent(email || 'user@example.com')}&token=${encodeURIComponent(token || 'token')}`;

  return (
    <Layout previewText={`Verify your email for ${brandName}`} brandName={brandName}>
      <Heading style={styles.h1}>Verify your email address</Heading>
      <Text style={styles.mainText}>
        Thanks for signing up for {brandName}. Please confirm your email address to activate your account and start exploring your personalized dashboard.
      </Text>

      <div style={{ textAlign: 'center' as const }}>
        <Button href={verifyUrl} style={styles.ctaButton}>
          Verify Email
        </Button>
      </div>

      <Hr />

      <Section style={styles.lowerSection}>
        <Text style={styles.cautionText}>
          If the button doesn't work, you can also copy and paste this link into your browser: <br /> <Link href={verifyUrl} style={styles.link}>{verifyUrl}</Link>
        </Text>
      </Section>
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
