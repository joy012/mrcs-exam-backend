import { render } from '@react-email/render';
import React from 'react';
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
    render: async (props) => render(React?.createElement(VerifyEmail, props)),
    defaultSubject: () => 'Verify your email',
  },
  'welcome-email': {
    render: async (props) => render(React.createElement(WelcomeEmail, props)),
    defaultSubject: (props) => `Welcome to ${props.brandName}`,
  },
  'forget-pass-email': {
    render: async (props) => render(React.createElement(ResetPassword, props)),
    defaultSubject: () => 'Reset your password',
  },
  'marketing-email': {
    render: async (props) => render(React.createElement(MarketingEmail, props)),
    defaultSubject: (props) => props.title,
  },
};
