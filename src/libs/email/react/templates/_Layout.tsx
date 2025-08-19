import { Body, Container, Head, Heading, Html, Preview, Section, Text } from '@react-email/components';
import React from 'react';

export type LayoutProps = {
  previewText?: string;
  brandName: string;
  children: React.ReactNode;
};

// Common email styles for all templates
const styles = {
  main: {
    backgroundColor: '#d2e5f9', // Light bluish background
    color: '#212121',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
  },
  container: {
    padding: '20px',
    margin: '0 auto',
    maxWidth: '700px',
  },
  coverSection: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
  header: {
    backgroundColor: '#7c3aed',
    padding: '32px 24px',
    textAlign: 'center' as const,
  },
  headerTitle: {
    margin: '0 0 12px 0',
    color: 'white',
    fontSize: '28px',
    fontWeight: '700',
    letterSpacing: '-0.025em',
  },
  headerSubtitle: {
    margin: '0',
    color: '#e0e7ff',
    fontSize: '16px',
    opacity: 0.95,
    fontWeight: '500',
  },
  content: {
    padding: '25px 35px',
    lineHeight: 1.6,
    background: '#ffffff',
  },
  footer: {
    textAlign: 'center' as const,
    padding: '20px 35px',
    color: '#64748b',
    fontSize: '14px',
    borderTop: '1px solid #f1f5f9',
    background: '#f8fafc',
  },
  footerText: {
    margin: '0 0 10px 0',
    color: '#64748b',
    fontWeight: '500',
  },
  footerSubtext: {
    margin: '0',
    color: '#94a3b8',
    fontSize: '13px',
  },
  bottomText: {
    color: '#64748b',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
    fontSize: '12px',
    padding: '0 20px',
    textAlign: 'center' as const,
    margin: '20px 0 0 0',
  },
};

export const Layout: React.FC<LayoutProps> = ({ previewText, brandName, children }) => {
  return (
    <Html>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
          {`
            a { 
              color: #7c3aed; 
              text-decoration: underline; 
            }
            img { 
              max-width: 100% !important; 
              height: auto !important; 
              display: block; 
            }
            @media only screen and (max-width: 600px) {
              body { 
                padding: 20px 10px !important; 
              }
              .content { 
                padding: 20px 25px !important; 
              }
              .footer { 
                padding: 20px 25px !important; 
              }
            }
          `}
        </style>
      </Head>
      {previewText ? <Preview>{previewText}</Preview> : null}
      <Body style={styles.main}>
        <Container style={styles.container}>
          <Section style={styles.coverSection}>
            {/* Header */}
            <Section style={styles.header}>
              <Heading style={styles.headerTitle}>
                {brandName}
              </Heading>
              <Text style={styles.headerSubtitle}>
                Master the MRCS with Confidence
              </Text>
            </Section>

            {/* Content */}
            <Section style={styles.content}>
              {children}
            </Section>

            {/* Footer */}
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
    </Html>
  );
};

export const BottomText: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Text style={styles.bottomText}>
    {children}
  </Text>
);
