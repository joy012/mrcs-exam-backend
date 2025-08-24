import { Env, Section } from 'atenv';
import { Transform } from 'class-transformer';

class DatabaseConfig {
  @Env('MONGO_URL')
  url: string;
}

class JWTConfig {
  @Env('JWT_SECRET')
  secret: string;

  @Env('JWT_ACCESS_TOKEN_EXPIRES_IN')
  accessTokenExpiresIn = '1h';

  @Env('JWT_REFRESH_TOKEN_EXPIRES_IN')
  refreshTokenExpiresIn = '14d';
}

class EmailConfig {
  @Env('EMAIL_FROM')
  from: string;

  @Env('SMTP_HOST')
  host: string;

  @Env('SMTP_PORT')
  @Transform(({ value }: { value?: string }) =>
    parseInt(value && value.length ? value : '587', 10),
  )
  port = 587;

  @Env('SMTP_USER')
  user: string;

  @Env('SMTP_PASS')
  pass: string;
}

class AdminConfig {
  @Env('ADMIN_EMAIL')
  adminEmail: string;

  @Env('ADMIN_PASSWORD')
  adminPassword: string;
}

class ServerConfig {
  @Env('PORT')
  @Transform(({ value }: { value?: string }) =>
    parseInt(value && value.length ? value : '3001', 10),
  )
  port = 3001;

  @Env('NODE_ENV')
  environment = 'development';

  @Env('FRONTEND_URL')
  frontendUrl = 'http://localhost:5173/';
}

class SecurityConfig {
  @Env('BCRYPT_ROUNDS')
  @Transform(({ value }: { value?: string }) =>
    parseInt(value && value.length ? value : '12', 10),
  )
  bcryptRounds = 12;

  @Env('APP_AUTH_KEY')
  appAuthKey: string;
}

class BrandConfig {
  @Env('BRAND_NAME')
  name = 'Zero To MRCS';
}

class CloudinaryConfig {
  @Env('CLOUDINARY_CLOUD_NAME')
  cloudName: string;

  @Env('CLOUDINARY_API_KEY')
  apiKey: string;

  @Env('CLOUDINARY_API_SECRET')
  apiSecret: string;
}

export class ConfigService {
  @Section(() => ServerConfig)
  server: ServerConfig;

  @Section(() => DatabaseConfig)
  database: DatabaseConfig;

  @Section(() => JWTConfig)
  jwt: JWTConfig;

  @Section(() => EmailConfig)
  email: EmailConfig;

  @Section(() => AdminConfig)
  admin: AdminConfig;

  @Section(() => SecurityConfig)
  security: SecurityConfig;

  @Section(() => BrandConfig)
  brand: BrandConfig;

  @Section(() => CloudinaryConfig)
  cloudinary: CloudinaryConfig;

  // Convenience getters for backward compatibility
  get port(): number {
    return this.server.port;
  }

  get nodeEnv(): string {
    return this.server.environment;
  }

  get isDevelopment(): boolean {
    return this.server.environment === 'development';
  }

  get isProduction(): boolean {
    return this.server.environment === 'production';
  }

  get isTest(): boolean {
    return this.server.environment === 'test';
  }

  get frontendUrl(): string {
    return this.server.frontendUrl;
  }

  get mongoUrl(): string {
    return this.database.url;
  }

  get jwtSecret(): string {
    return this.jwt.secret;
  }

  get jwtAccessTokenExpiresIn(): string {
    return this.jwt.accessTokenExpiresIn;
  }

  get jwtRefreshTokenExpiresIn(): string {
    return this.jwt.refreshTokenExpiresIn;
  }

  get emailFrom(): string {
    return this.email.from;
  }

  get smtpHost(): string {
    return this.email.host;
  }

  get smtpPort(): number {
    return this.email.port;
  }

  get smtpUser(): string {
    return this.email.user;
  }

  get smtpPass(): string {
    return this.email.pass;
  }

  get adminEmail(): string {
    return this.admin.adminEmail;
  }

  get adminPassword(): string {
    return this.admin.adminPassword;
  }

  get bcryptRounds(): number {
    return this.security.bcryptRounds;
  }

  get appAuthKey(): string {
    return this.security.appAuthKey;
  }

  get brandName(): string {
    return this.brand.name;
  }

  get cloudinaryCloudName(): string {
    return this.cloudinary.cloudName;
  }

  get cloudinaryApiKey(): string {
    return this.cloudinary.apiKey;
  }

  get cloudinaryApiSecret(): string {
    return this.cloudinary.apiSecret;
  }

  // Get all configuration as a single object
  getAll() {
    return {
      server: this.server,
      database: this.database,
      jwt: this.jwt,
      email: this.email,
      admin: this.admin,
      security: this.security,
      brand: this.brand,
      cloudinary: this.cloudinary,
    };
  }
}
