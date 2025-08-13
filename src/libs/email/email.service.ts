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
        secure: false,
        auth: { user: this.config.smtpUser, pass: this.config.smtpPass },
      });
    }
    return this.transporter;
  }

  private async sendRaw(options: {
    to: string;
    subject: string;
    html: string;
  }): Promise<void> {
    const from = this.config.emailFrom;
    const transporter = this.getTransporter();
    await transporter.sendMail({ from, ...options });
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
      brandPrimaryColor: this.config.brandPrimaryColor,
      brandLogoUrl: this.config.brandLogoUrl,
      frontendUrl: this.config.frontendUrl,
    } as const;

    const fullProps = { ...branding, ...params } as const;
    const rendered = await registryItem.render(fullProps);
    const subject = params.subject ?? registryItem.defaultSubject(fullProps);

    await this.sendRaw({ to: params.to, subject, html: rendered });
  }
}
