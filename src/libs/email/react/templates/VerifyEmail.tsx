import React from 'react';
import { Cta, Layout, Paragraph, Title } from './_Layout';

export type VerifyEmailProps = {
  brandName: string;
  brandPrimaryColor: string;
  brandLogoUrl?: string;
  frontendUrl: string;
  email: string;
  token: string;
};

export const VerifyEmail: React.FC<VerifyEmailProps> = ({ brandName, brandPrimaryColor, brandLogoUrl, frontendUrl, email, token }) => {
  const verifyUrl = `${frontendUrl.replace(/\/$/, '')}/verify-email?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`;
  return (
    <Layout previewText={`Verify your email for ${brandName}`} brandName={brandName} brandPrimaryColor={brandPrimaryColor} brandLogoUrl={brandLogoUrl}>
      <Title>Verify your email</Title>
      <Paragraph>Thanks for signing up for {brandName}. Please confirm your email address to activate your account and start exploring your dashboard.</Paragraph>
      <Cta href={verifyUrl} label="Verify Email" brandPrimaryColor={brandPrimaryColor} />
      <Paragraph>
        If the button does not work, use this link:
        <br />
        <a href={verifyUrl} className="text-sky-600 underline">{verifyUrl}</a>
      </Paragraph>
    </Layout>
  );
};

// Provide default preview props for the React Email dev server
const VerifyEmailWithPreview = Object.assign(VerifyEmail, {
  PreviewProps: {
    brandName: 'MRCS Exam',
    brandPrimaryColor: '#2563eb',
    brandLogoUrl: 'https://dummyimage.com/112x28/2563eb/ffffff&text=MRCS',
    frontendUrl: 'http://localhost:3000',
    email: 'user@example.com',
    token: 'abcdef123456',
  } as VerifyEmailProps,
});

export default VerifyEmailWithPreview;
