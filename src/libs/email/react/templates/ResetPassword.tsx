import React from 'react';
import { Cta, Layout, Paragraph, Title } from './_Layout';

export type ResetPasswordProps = {
  brandName: string;
  brandPrimaryColor: string;
  brandLogoUrl?: string;
  frontendUrl: string;
  email: string;
  token: string;
};

export const ResetPassword: React.FC<ResetPasswordProps> = ({ brandName, brandPrimaryColor, brandLogoUrl, frontendUrl, email, token }) => {
  const url = `${frontendUrl.replace(/\/$/, '')}/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`;
  return (
    <Layout previewText="Reset your password" brandName={brandName} brandPrimaryColor={brandPrimaryColor} brandLogoUrl={brandLogoUrl}>
      <Title>Reset your password</Title>
      <Paragraph>We received a request to reset your password. Click the button below to choose a new one. If you didn’t request this, you can safely ignore this email.</Paragraph>
      <Cta href={url} label="Reset Password" brandPrimaryColor={brandPrimaryColor} widthPct={50} />
      <Paragraph>
        If the button does not work, use this link:
        <br />
        <a href={url} className="text-sky-600 underline">{url}</a>
      </Paragraph>
    </Layout>
  );
};

// Provide default preview props for the React Email dev server
const ResetPasswordWithPreview = Object.assign(ResetPassword, {
  PreviewProps: {
    brandName: 'MRCS Exam',
    brandPrimaryColor: '#2563eb',
    brandLogoUrl: 'https://dummyimage.com/112x28/2563eb/ffffff&text=MRCS',
    frontendUrl: 'http://localhost:3000',
    email: 'user@example.com',
    token: 'abcdef123456',
  } as ResetPasswordProps,
});

export default ResetPasswordWithPreview;
