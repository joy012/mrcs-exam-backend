import { Injectable, Logger } from '@nestjs/common';
import nodemailer, { Transporter } from 'nodemailer';
import { ConfigService } from '../config/config.service';
import { templates } from './emailTemplates';
import type { TemplateParams } from './emailTemplates/types';

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
        secure: false,
        auth: { user: this.config.smtpUser, pass: this.config.smtpPass },
      });
    }
    return this.transporter;
  }

  async sendEmail(options: {
    to: string;
    subject: string;
    html: string;
  }): Promise<void> {
    const from = this.config.emailFrom;
    const transporter = this.getTransporter();
    await transporter.sendMail({ from, ...options });
  }

  renderTemplate(key: string, variables: Record<string, unknown>): string {
    const template = templates[key];
    if (!template) {
      this.logger.warn(`Email template not found: ${key}`);
      return '';
    }
    const params: TemplateParams = {
      brandName: this.config.brandName,
      brandPrimaryColor: this.config.brandPrimaryColor,
      brandLogoUrl: this.config.brandLogoUrl,
      frontendUrl: this.config.frontendUrl,
      ...variables,
    } as TemplateParams;
    return template(params);
  }

  buildVerifyEmailTemplate(email: string, token: string): string {
    return this.renderTemplate('verify-email', { email, token });
  }

  buildResetPasswordTemplate(email: string, token: string): string {
    return this.renderTemplate('reset-password', { email, token });
  }

  buildWelcomeTemplate(firstName?: string): string {
    return this.renderTemplate('welcome', { firstName: firstName ?? '' });
  }
}
