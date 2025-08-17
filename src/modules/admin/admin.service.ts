import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '../../libs/config/config.service';
import { PrismaService } from '../../libs/prisma/prisma.service';

@Injectable()
export class AdminService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.ensureAdminUser();
  }

  private async ensureAdminUser(): Promise<void> {
    const adminEmail = this.config.adminEmail;
    const adminPassword = this.config.adminPassword;
    console.log({ adminEmail, adminPassword });
    if (!adminEmail || !adminPassword) {
      this.logger.warn(
        'Admin seed skipped: missing ADMIN_EMAIL, ADMIN_PASSWORD in env',
      );
      return;
    }

    const existing = await this.prisma.user.findUnique({
      where: { email: adminEmail },
      select: { id: true, role: true, isEmailVerified: true },
    });

    if (existing) {
      if (existing.role !== UserRole.admin || !existing.isEmailVerified) {
        await this.prisma.user.update({
          where: { email: adminEmail },
          data: { role: UserRole.admin, isEmailVerified: true },
        });
        this.logger.log(
          'Existing admin user updated with admin role and verified email',
        );
      }
      return;
    }

    const salt = await bcrypt.genSalt(this.config.bcryptRounds);
    const passwordHash = await bcrypt.hash(adminPassword, salt);

    await this.prisma.user.create({
      data: {
        firstName: 'MRCS',
        lastName: 'Admin',
        role: UserRole.admin,
        isEmailVerified: true,
        medicalCollegeName: 'SOMC',
        email: adminEmail,
        password: passwordHash,
      },
      select: { id: true },
    });

    this.logger.log('Admin user created');
  }
}
