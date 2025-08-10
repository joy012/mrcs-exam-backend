import { Injectable, Logger } from '@nestjs/common';
import nodemailer, { Transporter } from 'nodemailer';
import { ConfigService } from '../config/config.service';

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

  buildVerifyEmailTemplate(email: string, token: string): string {
    const url = `${this.config.frontendUrl.replace(/\/$/, '')}/verify-email?email=${encodeURIComponent(
      email,
    )}&token=${encodeURIComponent(token)}`;
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Verify your email</h2>
        <p>Thanks for signing up. Please verify your email address by clicking the button below:</p>
        <p><a href="${url}" style="background:#1a73e8;color:#fff;padding:12px 20px;text-decoration:none;border-radius:6px;display:inline-block">Verify Email</a></p>
        <p>If the button does not work, use this link: <a href="${url}">${url}</a></p>
      </div>
    `;
  }

  buildResetPasswordTemplate(email: string, token: string): string {
    const url = `${this.config.frontendUrl.replace(/\/$/, '')}/reset-password?email=${encodeURIComponent(
      email,
    )}&token=${encodeURIComponent(token)}`;
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Reset your password</h2>
        <p>We received a request to reset your password. Click the button below to choose a new password:</p>
        <p><a href="${url}" style="background:#1a73e8;color:#fff;padding:12px 20px;text-decoration:none;border-radius:6px;display:inline-block">Reset Password</a></p>
        <p>If the button does not work, use this link: <a href="${url}">${url}</a></p>
      </div>
    `;
  }
}
