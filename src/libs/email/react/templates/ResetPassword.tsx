import React from 'react';
import { Cta, HighlightBox, Layout, Paragraph, Title } from './_Layout';

export type ResetPasswordProps = {
  brandName: string;
  frontendUrl: string;
  email: string;
  token: string;
};

// Email-specific styles
const styles = {
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
  warningText: {
    color: '#64748b',
    fontSize: '14px',
    fontStyle: 'italic',
    margin: '20px 0 0 0',
  },
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

export const ResetPassword: React.FC<ResetPasswordProps> = ({ brandName, frontendUrl, email, token }) => {
  const url = `${frontendUrl.replace(/\/$/, '')}/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`;
  return (
    <Layout previewText="Reset your password" brandName={brandName}>
      <Title>Reset your password</Title>
      <Paragraph>
        We received a request to reset your password for your {brandName} account. Click the button below to choose a new secure password.
      </Paragraph>

      <HighlightBox>
        <div style={styles.highlightTitle}>
          🔐 <strong>Security reminder:</strong>
        </div>
        <div style={styles.highlightSubtitle}>
          Choose a strong password that you haven't used elsewhere.
        </div>
      </HighlightBox>

      <Paragraph style={styles.warningText}>
        ⚠️ <strong>Important:</strong> If you didn't request this password reset, you can safely ignore this email. Your current password will remain unchanged.
      </Paragraph>

      <Cta href={url} label="Reset Password" widthPct={50} />

      <Paragraph style={styles.fallbackText}>
        If the button doesn't work, you can also copy and paste this link into your browser:
        <br />
        <a href={url} style={styles.fallbackLink}>
          {url}
        </a>
      </Paragraph>
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
