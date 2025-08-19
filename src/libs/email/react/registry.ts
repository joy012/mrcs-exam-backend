import { render } from '@react-email/render';
import * as React from 'react';
import { MarketingEmail } from './templates/MarketingEmail';
import { ResetPassword } from './templates/ResetPassword';
import { VerifyEmail } from './templates/VerifyEmail';
import { WelcomeEmail } from './templates/WelcomeEmail';

export type BrandingProps = {
  brandName: string;
  frontendUrl: string;
};

export type TemplatePayloadMap = {
  'verify-email': {
    email: string;
    token: string;
  };
  'welcome-email': {
    firstName?: string;
  };
  'forget-pass-email': {
    email: string;
    token: string;
  };
  'marketing-email': {
    title: string;
    contentHtml: string;
    ctaLabel?: string;
    ctaUrl?: string;
  };
};

export type TemplateKey = keyof TemplatePayloadMap;

type FullProps<K extends TemplateKey> = BrandingProps & TemplatePayloadMap[K];

export type TemplateRegistryItem<K extends TemplateKey> = {
  render: (props: FullProps<K>) => Promise<string> | string;
  defaultSubject: (props: FullProps<K>) => string;
};
export type TemplateRegistry = { [K in TemplateKey]: TemplateRegistryItem<K> };

export const templateRegistry: TemplateRegistry = {
  'verify-email': {
    render: async (props) => {
      try {
        const element = React.createElement(VerifyEmail, props);
        const rendered = await render(element);
        return rendered;
      } catch (error) {
        console.error('Error rendering verify-email template:', error);
        throw error;
      }
    },
    defaultSubject: () => 'Verify your email',
  },
  'welcome-email': {
    render: async (props) => {
      try {
        const element = React.createElement(WelcomeEmail, props);
        const rendered = await render(element);
        return rendered;
      } catch (error) {
        console.error('Error rendering welcome-email template:', error);
        throw error;
      }
    },
    defaultSubject: (props) => `Welcome to ${props.brandName}`,
  },
  'forget-pass-email': {
    render: async (props) => {
      try {
        const element = React.createElement(ResetPassword, props);
        const rendered = await render(element);
        return rendered;
      } catch (error) {
        console.error('Error rendering forget-pass-email template:', error);
        throw error;
      }
    },
    defaultSubject: () => 'Reset your password',
  },
  'marketing-email': {
    render: async (props) => {
      try {
        const element = React.createElement(MarketingEmail, props);
        const rendered = await render(element);
        return rendered;
      } catch (error) {
        console.error('Error rendering marketing-email template:', error);
        throw error;
      }
    },
    defaultSubject: (props) => props.title,
  },
};
