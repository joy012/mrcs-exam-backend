import { Body, Button, Container, Head, Heading, Html, Preview, Section, Tailwind, Text } from '@react-email/components';
import React from 'react';

export type LayoutProps = {
  previewText?: string;
  brandName: string;
  children: React.ReactNode;
};

// Email-compatible styles object
const styles = {
  body: {
    fontFamily: 'Inter, -apple-system, Segoe UI, Roboto, Arial, Helvetica, sans-serif',
    background: '#fafafa',
    margin: 0,
    padding: 0,
    color: '#1e293b',
  },
  container: {
    margin: '24px auto',
    maxWidth: '640px',
    padding: '20px',
  },
  card: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  },
  header: {
    padding: '20px 32px',
    textAlign: 'center' as const,
    background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
  },
  headerPattern: {
    display: 'none',
  },
  logo: {
    margin: '0 auto 12px',
    width: '48px',
    height: '48px',
    background: '#ffffff',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#8b5cf6',
    border: '2px solid rgba(255,255,255,0.3)',
  },
  headerTitle: {
    margin: 0,
    color: 'white',
    fontSize: '22px',
    fontWeight: 'bold',
    letterSpacing: '-0.025em',
  },
  headerSubtitle: {
    margin: '4px 0 0 0',
    color: '#f3e8ff',
    fontSize: '14px',
    opacity: 0.95,
  },
  content: {
    padding: '32px 32px',
    lineHeight: 1.6,
    background: '#ffffff',
  },
  footer: {
    textAlign: 'center' as const,
    padding: '24px 32px',
    color: '#64748b',
    fontSize: '14px',
    borderTop: '1px solid #f1f5f9',
    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
  },
  footerText: {
    margin: 0,
    color: '#475569',
    fontWeight: '500',
  },
  footerSubtext: {
    margin: '6px 0 0 0',
    color: '#64748b',
    fontSize: '12px',
  },
  ctaSection: {
    textAlign: 'center' as const,
    margin: '24px 0',
  },
  ctaButton: {
    width: '50%',
    minWidth: '200px',
  },
  paragraph: {
    color: '#334155',
    fontSize: '16px',
    lineHeight: 1.6,
    margin: '0 0 12px 0',
  },
  title: {
    margin: '0 0 12px 0',
    letterSpacing: '-0.025em',
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#1e293b',
  },
  subtitle: {
    margin: '0 0 16px 0',
    color: '#475569',
    fontSize: '17px',
    fontWeight: '500',
  },
};

export const Layout: React.FC<LayoutProps> = ({ previewText, brandName, children }) => {
  return (
    <Html>
      <Head>
        {/* Viewport for mobile scaling */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Google Fonts */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* Email-compatible styles */}
        <style>
          {`
            a { 
              color: #8b5cf6; 
              text-decoration: underline; 
            }
            img { 
              max-width: 100% !important; 
              height: auto !important; 
              display: block; 
            }
            .email-button {
              display: inline-block;
              background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
              color: white;
              text-decoration: none;
              font-weight: 600;
              padding: 16px 32px;
              border-radius: 16px;
              font-size: 16px;
              text-align: center;
              border: none;
              min-width: 200px;
            }
            .highlight-box {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 16px;
              padding: 20px;
              margin: 20px 0;
            }
          `}
        </style>
      </Head>
      {previewText ? <Preview>{previewText}</Preview> : null}
      <Tailwind>
        <Body style={styles.body}>
          <Container style={styles.container}>
            {/* Modern Card with Soft Shadows */}
            <Section style={styles.card}>
              {/* Beautiful Header with Gradient */}
              <Section style={styles.header}>
                {/* Subtle background patterns */}
                <div style={styles.headerPattern} />

                {/* Modern Logo */}
                <div style={styles.logo}>
                  ZM
                </div>

                <Heading as="h3" style={styles.headerTitle}>
                  {brandName}
                </Heading>

                {/* Subtle subtitle */}
                <Text style={styles.headerSubtitle}>
                  Master the MRCS with Confidence
                </Text>
              </Section>

              {/* Content with Soft Background */}
              <Section style={styles.content}>
                {children}
              </Section>

              {/* Modern Footer */}
              <Section style={styles.footer}>
                <Text style={styles.footerText}>
                  © {new Date().getFullYear()} {brandName}. All rights reserved.
                </Text>
                <Text style={styles.footerSubtext}>
                  Empowering medical professionals to excel in their MRCS journey
                </Text>
              </Section>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export const Cta: React.FC<{ href: string; label: string; widthPct?: number }> = ({ href, label, widthPct = 50 }) => (
  <Section style={styles.ctaSection}>
    <Button
      href={href}
      className="email-button"
      style={{
        ...styles.ctaButton,
        width: `${widthPct}%`,
      }}
    >
      {label}
    </Button>
  </Section>
);

export const Paragraph: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className }) => (
  <Text style={styles.paragraph}>
    {children}
  </Text>
);

export const Title: React.FC<React.PropsWithChildren> = ({ children }) => (
  <Heading as="h2" style={styles.title}>
    {children}
  </Heading>
);

export const Subtitle: React.FC<React.PropsWithChildren> = ({ children }) => (
  <Text style={styles.subtitle}>
    {children}
  </Text>
);

export const HighlightBox: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className }) => (
  <Section className="highlight-box">
    {children}
  </Section>
);


