import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { ConfigService } from '../config/config.service';
import {
  TemplateKey,
  TemplatePayloadMap,
  templateRegistry,
  TemplateRegistryItem,
} from './react/registry';

interface TransportConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  requireTLS?: boolean;
  ignoreTLS?: boolean;
  tls?: {
    rejectUnauthorized: boolean;
  };
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter | null = null;

  constructor(private readonly config: ConfigService) {
    this.validateEmailConfiguration();
  }

  private validateEmailConfiguration(): void {
    const requiredFields = {
      smtpHost: this.config.smtpHost,
      smtpUser: this.config.smtpUser,
      smtpPass: this.config.smtpPass,
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      this.logger.error('Missing required email configuration:', missingFields);
      this.logConfigurationStatus();
    }
  }

  private logConfigurationStatus(): void {
    this.logger.error('Email Configuration Status:');
    this.logger.error(
      `SMTP Host: ${this.config.smtpHost ? '✓ Set' : '✗ Missing'}`,
    );
    this.logger.error(
      `SMTP User: ${this.config.smtpUser ? '✓ Set' : '✗ Missing'}`,
    );
    this.logger.error(
      `SMTP Pass: ${this.config.smtpPass ? '✓ Set' : '✗ Missing'}`,
    );
  }

  private createTransportConfig(): TransportConfig {
    const isGmail = this.config.smtpHost === 'smtp.gmail.com';
    const isPort587 = this.config.smtpPort === 587;
    const isPort465 = this.config.smtpPort === 465;

    const transportConfig: TransportConfig = {
      host: this.config.smtpHost,
      port: this.config.smtpPort,
      secure: isPort465,
      auth: {
        user: this.config.smtpUser,
        pass: this.config.smtpPass,
      },
    };

    // Gmail specific configuration
    if (isGmail) {
      transportConfig.secure = false; // Use STARTTLS for port 587
      transportConfig.requireTLS = true;
      transportConfig.ignoreTLS = false;
    }

    // TLS configuration for port 587
    if (isPort587) {
      transportConfig.tls = {
        rejectUnauthorized: false, // Only for development, remove in production
      };
    }

    return transportConfig;
  }

  private logTransportConfig(transportConfig: TransportConfig): void {
    this.logger.log('Creating email transporter with config:', {
      host: transportConfig.host,
      port: transportConfig.port,
      secure: transportConfig.secure,
      user: transportConfig.auth.user,
      // Don't log the password
    });
  }

  private logGmailTroubleshooting(): void {
    this.logger.error('For Gmail, make sure to:');
    this.logger.error('1. Use an App Password (not your regular password)');
    this.logger.error('2. Enable 2-Factor Authentication');
    this.logger.error(
      '3. Generate App Password for "Mail" in Google Account settings',
    );
  }

  private getTransporter(): Transporter {
    if (!this.transporter) {
      try {
        const transportConfig = this.createTransportConfig();
        this.logTransportConfig(transportConfig);

        this.transporter = nodemailer.createTransport(transportConfig);

        // Verify connection configuration
        this.transporter.verify((error, success) => {
          if (error) {
            this.logger.error('SMTP connection failed:', error);
            this.logger.error(
              'Please check your SMTP credentials and configuration',
            );

            if (this.config.smtpHost === 'smtp.gmail.com') {
              this.logGmailTroubleshooting();
            }
          } else {
            this.logger.log('SMTP server is ready to send emails');
          }
        });
      } catch (error) {
        this.logger.error('Failed to create email transporter:', error);
        throw new Error(`Failed to create email transporter: ${error.message}`);
      }
    }
    return this.transporter;
  }

  async testConnection(): Promise<boolean> {
    try {
      this.logger.log('Testing email connection...');
      this.logger.log(`SMTP Host: ${this.config.smtpHost}`);
      this.logger.log(`SMTP Port: ${this.config.smtpPort}`);
      this.logger.log(`SMTP User: ${this.config.smtpUser}`);
      this.logger.log(
        `SMTP Pass length: ${this.config.smtpPass?.length || 0} characters`,
      );

      const transporter = this.getTransporter();
      await transporter.verify();
      this.logger.log('Email connection test successful');
      return true;
    } catch (error) {
      this.logger.error('Email connection test failed:', error);
      return false;
    }
  }

  private async sendRaw(options: {
    to: string;
    subject: string;
    html: string;
  }): Promise<void> {
    try {
      const from = this.config.emailFrom;
      const transporter = this.getTransporter();

      this.logger.log(`Sending email to: ${options.to}`);
      await transporter.sendMail({ from, ...options });
      this.logger.log(`Email sent successfully to: ${options.to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}:`, error);
      throw new Error(`Email sending failed: ${error.message}`);
    }
  }

  private createVerifyEmailHtml(props: {
    brandName: string;
    frontendUrl: string;
    email: string;
    token: string;
  }): string {
    const verifyUrl = `${props.frontendUrl.replace(/\/$/, '')}/verify-email?email=${encodeURIComponent(props.email)}&token=${encodeURIComponent(props.token)}`;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify your email</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              max-width: 600px; 
              margin: 0 auto; 
              padding: 20px; 
            }
            .header { 
              background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); 
              color: white; 
              padding: 30px; 
              text-align: center; 
              border-radius: 10px 10px 0 0; 
            }
            .content { 
              background: white; 
              padding: 30px; 
              border: 1px solid #e2e8f0; 
              border-top: none; 
            }
            .button { 
              display: inline-block; 
              background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); 
              color: white; 
              text-decoration: none; 
              padding: 15px 30px; 
              border-radius: 8px; 
              font-weight: 600; 
              margin: 20px 0; 
            }
            .footer { 
              background: #f8fafc; 
              padding: 20px; 
              text-align: center; 
              border-radius: 0 0 10px 10px; 
              border: 1px solid #e2e8f0; 
              border-top: none; 
            }
            .fallback-link { 
              color: #8b5cf6; 
              word-break: break-all; 
              font-size: 12px; 
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${props.brandName}</h1>
            <p>Master the MRCS with Confidence</p>
          </div>
          <div class="content">
            <h2>Verify your email</h2>
            <p><strong>Welcome to your MRCS journey!</strong></p>
            <p>Thanks for signing up for ${props.brandName}. Please confirm your email address to activate your account and start exploring your personalized dashboard.</p>
            <div style="text-align: center;">
              <a href="${verifyUrl}" class="button">Verify Email</a>
            </div>
            <p style="text-align: center; color: #64748b; font-size: 14px;">
              If the button doesn't work, you can also copy and paste this link into your browser:
            </p>
            <p style="text-align: center;">
              <a href="${verifyUrl}" class="fallback-link">${verifyUrl}</a>
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} ${props.brandName}. All rights reserved.</p>
            <p style="font-size: 12px; color: #64748b;">Empowering medical professionals to excel in their MRCS journey</p>
          </div>
        </body>
      </html>
    `;
  }

  private createWelcomeEmailHtml(props: {
    brandName: string;
    frontendUrl: string;
    firstName?: string;
  }): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to ${props.brandName}</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              max-width: 600px; 
              margin: 0 auto; 
              padding: 20px; 
            }
            .header { 
              background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); 
              color: white; 
              padding: 30px; 
              text-align: center; 
              border-radius: 10px 10px 0 0; 
            }
            .content { 
              background: white; 
              padding: 30px; 
              border: 1px solid #e2e8f0; 
              border-top: none; 
            }
            .button { 
              display: inline-block; 
              background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); 
              color: white; 
              text-decoration: none; 
              padding: 15px 30px; 
              border-radius: 8px; 
              font-weight: 600; 
              margin: 20px 0; 
            }
            .footer { 
              background: #f8fafc; 
              padding: 20px; 
              text-align: center; 
              border-radius: 0 0 10px 10px; 
              border: 1px solid #e2e8f0; 
              border-top: none; 
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${props.brandName}</h1>
            <p>Master the MRCS with Confidence</p>
          </div>
          <div class="content">
            <h2>Welcome to ${props.brandName}!</h2>
            <p><strong>Hello ${props.firstName || 'there'}!</strong></p>
            <p>Your email has been successfully verified! 🎉</p>
            <p>You're now ready to start your MRCS preparation journey. Log in to your dashboard to access practice questions, study materials, and track your progress.</p>
            <div style="text-align: center;">
              <a href="${props.frontendUrl}/dashboard" class="button">Go to Dashboard</a>
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} ${props.brandName}. All rights reserved.</p>
            <p style="font-size: 12px; color: #64748b;">Empowering medical professionals to excel in their MRCS journey</p>
          </div>
        </body>
      </html>
    `;
  }

  private createForgotPasswordEmailHtml(props: {
    brandName: string;
    frontendUrl: string;
    email: string;
    token: string;
  }): string {
    const resetUrl = `${props.frontendUrl.replace(/\/$/, '')}/reset-password?email=${encodeURIComponent(props.email)}&token=${encodeURIComponent(props.token)}`;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset your password</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              max-width: 600px; 
              margin: 0 auto; 
              padding: 20px; 
            }
            .header { 
              background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); 
              color: white; 
              padding: 30px; 
              text-align: center; 
              border-radius: 10px 10px 0 0; 
            }
            .content { 
              background: white; 
              padding: 30px; 
              border: 1px solid #e2e8f0; 
              border-top: none; 
            }
            .button { 
              display: inline-block; 
              background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); 
              color: white; 
              text-decoration: none; 
              padding: 15px 30px; 
              border-radius: 8px; 
              font-weight: 600; 
              margin: 20px 0; 
            }
            .footer { 
              background: #f8fafc; 
              padding: 20px; 
              text-align: center; 
              border-radius: 0 0 10px 10px; 
              border: 1px solid #e2e8f0; 
              border-top: none; 
            }
            .fallback-link { 
              color: #8b5cf6; 
              word-break: break-all; 
              font-size: 12px; 
            }
            .warning { 
              background: #fef3c7; 
              border: 1px solid #f59e0b; 
              border-radius: 8px; 
              padding: 15px; 
              margin: 20px 0; 
              color: #92400e; 
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${props.brandName}</h1>
            <p>Master the MRCS with Confidence</p>
          </div>
          <div class="content">
            <h2>Reset your password</h2>
            <p>We received a request to reset your password for your ${props.brandName} account.</p>
            <div class="warning">
              <strong>⚠️ Security Notice:</strong> If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
            </div>
            <p>To reset your password, click the button below:</p>
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            <p style="text-align: center; color: #64748b; font-size: 14px;">
              If the button doesn't work, you can also copy and paste this link into your browser:
            </p>
            <p style="text-align: center;">
              <a href="${resetUrl}" class="fallback-link">${resetUrl}</a>
            </p>
            <p><strong>This link will expire in 1 hour for security reasons.</strong></p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} ${props.brandName}. All rights reserved.</p>
            <p style="font-size: 12px; color: #64748b;">Empowering medical professionals to excel in their MRCS journey</p>
          </div>
        </body>
      </html>
    `;
  }

  async sendTemplate<K extends TemplateKey>(
    key: K,
    params: TemplatePayloadMap[K] & { to: string; subject?: string },
  ): Promise<void> {
    // Use the React Email registry for all templates
    const registryItem: TemplateRegistryItem<K> = templateRegistry[key];
    if (!registryItem) {
      throw new Error(`Email template not registered: ${String(key)}`);
    }

    const branding = {
      brandName: this.config.brandName,
      frontendUrl: this.config.frontendUrl,
    } as const;

    const fullProps = { ...branding, ...params } as const;

    try {
      this.logger.log(`Rendering ${key} template with React Email`);
      const rendered = await registryItem.render(fullProps);
      const subject = params.subject ?? registryItem.defaultSubject(fullProps);

      await this.sendRaw({ to: params.to, subject, html: rendered });
      this.logger.log(`Email template ${key} rendered and sent successfully`);
    } catch (error) {
      this.logger.error(
        `Failed to render ${key} template with React Email:`,
        error,
      );
      this.logger.log(`Falling back to HTML template for ${key}`);

      // Fallback to HTML templates if React Email fails
      await this.sendTemplateFallback(key, params);
    }
  }

  private async sendTemplateFallback<K extends TemplateKey>(
    key: K,
    params: TemplatePayloadMap[K] & { to: string; subject?: string },
  ): Promise<void> {
    const branding = {
      brandName: this.config.brandName,
      frontendUrl: this.config.frontendUrl,
    } as const;

    let html: string;
    let subject: string;

    switch (key) {
      case 'verify-email': {
        const verifyParams = params as TemplatePayloadMap['verify-email'] & {
          to: string;
          subject?: string;
        };
        html = this.createVerifyEmailHtml({
          brandName: branding.brandName,
          frontendUrl: branding.frontendUrl,
          email: verifyParams.email,
          token: verifyParams.token,
        });
        subject = verifyParams.subject ?? 'Verify your email';
        break;
      }

      case 'welcome-email': {
        const welcomeParams = params as TemplatePayloadMap['welcome-email'] & {
          to: string;
          subject?: string;
        };
        html = this.createWelcomeEmailHtml({
          brandName: branding.brandName,
          frontendUrl: branding.frontendUrl,
          firstName: welcomeParams.firstName,
        });
        subject = welcomeParams.subject ?? `Welcome to ${branding.brandName}`;
        break;
      }

      case 'forget-pass-email': {
        const forgotParams =
          params as TemplatePayloadMap['forget-pass-email'] & {
            to: string;
            subject?: string;
          };
        html = this.createForgotPasswordEmailHtml({
          brandName: branding.brandName,
          frontendUrl: branding.frontendUrl,
          email: forgotParams.email,
          token: forgotParams.token,
        });
        subject = forgotParams.subject ?? 'Reset your password';
        break;
      }

      default:
        throw new Error(`No fallback template available for: ${String(key)}`);
    }

    await this.sendRaw({ to: params.to, subject, html });
  }

  // Test method to verify HTML templates are working
  testHtmlTemplates(): void {
    const testProps = {
      brandName: 'Test Brand',
      frontendUrl: 'http://localhost:3000',
      email: 'test@example.com',
      token: 'test-token-123',
      firstName: 'John',
    };

    try {
      const verifyHtml = this.createVerifyEmailHtml({
        brandName: testProps.brandName,
        frontendUrl: testProps.frontendUrl,
        email: testProps.email,
        token: testProps.token,
      });

      const welcomeHtml = this.createWelcomeEmailHtml({
        brandName: testProps.brandName,
        frontendUrl: testProps.frontendUrl,
        firstName: testProps.firstName,
      });

      const forgotHtml = this.createForgotPasswordEmailHtml({
        brandName: testProps.brandName,
        frontendUrl: testProps.frontendUrl,
        email: testProps.email,
        token: testProps.token,
      });

      this.logger.log('HTML templates test successful');
      this.logger.log(`Verify email length: ${verifyHtml.length}`);
      this.logger.log(`Welcome email length: ${welcomeHtml.length}`);
      this.logger.log(`Forgot password email length: ${forgotHtml.length}`);
    } catch (error) {
      this.logger.error('HTML templates test failed:', error);
    }
  }
}
