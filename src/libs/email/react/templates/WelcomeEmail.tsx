import { Img, Section } from '@react-email/components';
import React from 'react';
import { Cta, Layout, Paragraph, Title } from './_Layout';

export type WelcomeEmailProps = {
  brandName: string;
  brandPrimaryColor: string;
  brandLogoUrl?: string;
  frontendUrl: string;
  firstName?: string;
};

export const WelcomeEmail: React.FC<WelcomeEmailProps> = ({ brandName, brandPrimaryColor, brandLogoUrl, frontendUrl, firstName }) => {
  const nameSuffix = firstName?.trim() ? `, ${firstName.trim()}` : '';
  const dashboardUrl = frontendUrl.replace(/\/$/, '');
  return (
    <Layout previewText={`Welcome to ${brandName}`} brandName={brandName} brandPrimaryColor={brandPrimaryColor} brandLogoUrl={brandLogoUrl}>
      <Section className="mb-4" style={{ textAlign: 'center' }}>
        <Img src="https://images.unsplash.com/photo-1529336953121-ad5a5f9bcd4b?w=1200&q=80&auto=format&fit=crop" alt="Welcome" className="w-full rounded-lg" />
      </Section>
      <Title>Welcome{nameSuffix} 👋</Title>
      <Paragraph>We’re thrilled to have you at {brandName}. Your account is ready to go.</Paragraph>
      <Paragraph className="text-slate-600">Tip: You can manage your profile and settings anytime from your dashboard.</Paragraph>
      <Cta href={dashboardUrl} label="Go to Dashboard" brandPrimaryColor={brandPrimaryColor} />
    </Layout>
  );
};

// Provide default preview props for the React Email dev server
const WelcomeEmailWithPreview = Object.assign(WelcomeEmail, {
  PreviewProps: {
    brandName: 'MRCS Exam',
    brandPrimaryColor: '#2563eb',
    brandLogoUrl: 'https://dummyimage.com/112x28/2563eb/ffffff&text=MRCS',
    frontendUrl: 'http://localhost:3000',
    firstName: 'Alex',
  } as WelcomeEmailProps,
});

export default WelcomeEmailWithPreview;
