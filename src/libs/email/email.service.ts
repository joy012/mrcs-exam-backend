import { Injectable, Logger } from '@nestjs/common';
import nodemailer, { Transporter } from 'nodemailer';
import { ConfigService } from '../config/config.service';
import {
  TemplateKey,
  TemplatePayloadMap,
  templateRegistry,
  TemplateRegistryItem,
} from './react/registry';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter | null = null;

  constructor(private readonly config: ConfigService) {}

  private getTransporter(): Transporter {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: this.config.smtpHost,
        port: this.config.smtpPort,
        secure: this.config.smtpPort === 465, // true for 465, false for other ports
        auth: {
          user: this.config.smtpUser,
          pass: this.config.smtpPass,
        },
        tls: {
          rejectUnauthorized: false, // Only for development, remove in production
        },
      });

      // Verify connection configuration
      this.transporter.verify((error, success) => {
        if (error) {
          this.logger.error('SMTP connection failed:', error);
        } else {
          this.logger.log('SMTP server is ready to send emails');
        }
      });
    }
    return this.transporter;
  }

  async testConnection(): Promise<boolean> {
    try {
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
