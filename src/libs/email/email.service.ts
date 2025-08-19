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

  async sendTemplate<K extends TemplateKey>(
    key: K,
    params: TemplatePayloadMap[K] & { to: string; subject?: string },
  ): Promise<void> {
    const registryItem: TemplateRegistryItem<K> = templateRegistry[key];
    if (!registryItem) {
      throw new Error(`Email template not registered: ${String(key)}`);
    }

    const branding = {
      brandName: this.config.brandName,
      frontendUrl: this.config.frontendUrl,
    } as const;

    const fullProps = { ...branding, ...params } as const;
    const rendered = await registryItem.render(fullProps);
    const subject = params.subject ?? registryItem.defaultSubject(fullProps);

    await this.sendRaw({ to: params.to, subject, html: rendered });
  }
}
