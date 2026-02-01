# MRCS Exam Backend

Backend API for **Zero To MRCS** — MRCS exam preparation platform. Built with NestJS, Prisma, and MongoDB.

---

## Features

- **Authentication** — JWT-based auth, email verification, forgot/reset password, session management
- **User management** — Profile, avatar upload, role-based access (student / admin)
- **Exam intakes** — Manage exam intake periods (e.g. January, April/May, September)
- **Question categories** — Basic and clinical categories, CRUD, filter by type
- **Questions** — Full CRUD, filters (intake, category, year, source), lock/unlock for edits
- **Question bank practice** — Student practice sessions, answers, notes, favorites, stats, reset
- **Email** — Nodemailer with React Email templates (welcome, verify, reset password)
- **Storage** — Cloudinary for avatars and media; Sharp for image resizing/WebP
- **API docs** — Swagger UI at `/api` and JSON at `/api/reference/json`

---

## Tech Stack

| Layer        | Technology                          |
| ------------ | ------------------------------------ |
| Runtime      | Node.js                              |
| Framework    | NestJS 11                            |
| Language     | TypeScript                           |
| API style    | REST, Nestia (typed routes)          |
| Validation   | class-validator, Typia               |
| ORM / DB     | Prisma 6, MongoDB                   |
| Auth         | Passport JWT, bcrypt                 |
| Docs         | Swagger (Nestia), OpenAPI            |
| Email        | Nodemailer, React Email              |
| Storage      | Cloudinary, Multer, Sharp            |
| Config       | atenv, dotenv, YAML (env.yaml)       |

---

## API Overview

Base URL: `/api` (e.g. `http://localhost:3001/api`).

### Auth — `POST /api/auth/*`

| Method | Path                         | Description                    |
| ------ | ---------------------------- | ------------------------------ |
| POST   | `/api/auth/signup`           | Register                      |
| POST   | `/api/auth/login`            | Login                         |
| POST   | `/api/auth/verify-email`     | Verify email token            |
| POST   | `/api/auth/complete-profile` | Complete profile (JWT)        |
| POST   | `/api/auth/forgot-password`  | Request reset email           |
| POST   | `/api/auth/reset-password`   | Reset password with token     |
| POST   | `/api/auth/refresh`         | Refresh access token          |
| POST   | `/api/auth/resend-verification` | Resend verification email  |
| POST   | `/api/auth/resend-forgot-password` | Resend forgot-password email |
| POST   | `/api/auth/logout`           | Logout (JWT)                  |
| POST   | `/api/auth/logout/:sessionId`| Logout specific session (JWT) |
| POST   | `/api/auth/session`          | Create session (JWT)          |
| POST   | `/api/auth/terminate-all-sessions` | Terminate all sessions (JWT) |
| GET    | `/api/auth/test-email`       | Test email config             |

### User — `GET|POST|PATCH|DELETE /api/user/*` (JWT)

| Method | Path                   | Description        | Role   |
| ------ | ---------------------- | ------------------ | ------ |
| POST   | `/api/user`            | Create user        | admin  |
| GET    | `/api/user/me`         | Current user       | any    |
| PATCH  | `/api/user/me`         | Update self        | any    |
| GET    | `/api/user`            | List users         | admin  |
| GET    | `/api/user/:id`        | Get user by ID     | admin  |
| PATCH  | `/api/user/:id`        | Update user        | admin  |
| DELETE | `/api/user/:id`        | Delete user        | admin  |
| POST   | `/api/user/upload/avatar` | Upload avatar   | any    |
| POST   | `/api/user/upload/media`  | Upload media    | any    |

### Exam Intake — `GET|PATCH /api/exam-intake/*` (JWT, admin)

| Method | Path                            | Description           |
| ------ | ------------------------------- | --------------------- |
| GET    | `/api/exam-intake`              | List exam intakes     |
| GET    | `/api/exam-intake/:id`          | Get by ID             |
| PATCH  | `/api/exam-intake/:id/active-status` | Update active status |

### Question Category — `GET|POST|PATCH|DELETE /api/question-category/*` (JWT, admin)

| Method | Path                                  | Description              |
| ------ | ------------------------------------- | ------------------------ |
| GET    | `/api/question-category`              | List all                 |
| GET    | `/api/question-category/type/:type`    | By type (BASIC/CLINICAL) |
| GET    | `/api/question-category/:id`           | Get by ID                |
| POST   | `/api/question-category`              | Create                   |
| PATCH  | `/api/question-category/:id`          | Update                   |
| PATCH  | `/api/question-category/:id/active-status` | Update active     |
| DELETE | `/api/question-category/:id`          | Delete                   |

### Question — `GET|POST|PUT|PATCH|DELETE /api/question/*` (JWT, admin)

| Method | Path                          | Description          |
| ------ | ----------------------------- | -------------------- |
| GET    | `/api/question`               | List (query params)   |
| GET    | `/api/question/details/:id`   | Get by ID            |
| GET    | `/api/question/filters`       | Filter options       |
| POST   | `/api/question`               | Create               |
| PUT    | `/api/question/:id`           | Update               |
| DELETE | `/api/question/:id`           | Delete               |
| PATCH  | `/api/question/:id/toggle-lock` | Toggle edit lock   |

### Question Bank Practice — `GET|POST|PUT /api/question-bank-practice/*` (JWT, student)

| Method | Path                                      | Description           |
| ------ | ----------------------------------------- | --------------------- |
| GET    | `/api/question-bank-practice`             | Practice list (query)  |
| GET    | `/api/question-bank-practice/filters`     | Filter options        |
| GET    | `/api/question-bank-practice/stats`       | User stats            |
| POST   | `/api/question-bank-practice/answer`      | Submit answer         |
| PUT    | `/api/question-bank-practice/:questionId/note` | Update note    |
| POST   | `/api/question-bank-practice/reset`       | Reset practice        |
| POST   | `/api/question-bank-practice/toggle-favorite` | Toggle favorite  |

### Root

| Method | Path   | Description     |
| ------ | ------ | --------------- |
| GET    | `/`    | Health / hello  |

---

## Setup

### Prerequisites

- Node.js 18+
- pnpm (or npm/yarn)
- MongoDB (local or Atlas)
- (Optional) SMTP for email; Cloudinary for storage

### 1. Clone and install

```bash
git clone <repository-url>
cd mrcs-exam-backend
pnpm install
```

### 2. Environment variables

Create a `.env` file in the project root (or use `env.yaml` in YAML format). The app loads `.env` first, then overlays `env.yaml` if present.

**Required (no real values below — use your own):**

| Variable              | Description                          |
| --------------------- | ------------------------------------ |
| `MONGO_URL`           | MongoDB connection string            |
| `JWT_SECRET`          | Secret for JWT signing               |
| `APP_AUTH_KEY`        | App auth key for public endpoints    |
| `ADMIN_EMAIL`         | Admin account email                  |
| `ADMIN_PASSWORD`      | Admin account password               |
| `EMAIL_FROM`          | Sender email address                 |
| `SMTP_HOST`           | SMTP host (e.g. smtp.gmail.com)      |
| `SMTP_PORT`           | SMTP port (e.g. 587)                 |
| `SMTP_USER`           | SMTP username                        |
| `SMTP_PASS`           | SMTP password                        |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name            |
| `CLOUDINARY_API_KEY`  | Cloudinary API key                   |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret             |

**Optional (with defaults):**

| Variable                    | Default        | Description        |
| --------------------------- | -------------- | ------------------ |
| `PORT`                      | 3001           | Server port        |
| `NODE_ENV`                  | development    | Environment        |
| `FRONTEND_URL`              | http://localhost:5173/ | Frontend URL |
| `JWT_ACCESS_TOKEN_EXPIRES_IN`  | 1h         | Access token TTL   |
| `JWT_REFRESH_TOKEN_EXPIRES_IN` | 14d        | Refresh token TTL   |
| `BCRYPT_ROUNDS`             | 12             | Bcrypt rounds      |
| `BRAND_NAME`                | Zero To MRCS   | Brand name         |

**Example `.env` (placeholders only — do not commit real secrets):**

```env
MONGO_URL="mongodb+srv://user:password@cluster.mongodb.net/dbname"
JWT_SECRET="your-jwt-secret"
APP_AUTH_KEY="your-app-auth-key"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="secure-password"
EMAIL_FROM="noreply@example.com"
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="smtp-user"
SMTP_PASS="smtp-password"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

### 3. Generate Prisma client

```bash
pnpm run gen:prisma
```

### 4. Run the app

```bash
# Development (watch mode)
pnpm run start:dev

# Production build then run
pnpm run build
pnpm run start:prod
```

Server runs at `http://localhost:3001` (or your `PORT`). API base: `http://localhost:3001/api`. Swagger UI: `http://localhost:3001/api`.

---

## Scripts

| Command           | Description                    |
| ----------------- | ------------------------------ |
| `pnpm install`    | Install dependencies           |
| `pnpm run build`  | Generate Prisma + Nest build   |
| `pnpm run start` | Start (no watch)               |
| `pnpm run start:dev` | Start in watch mode        |
| `pnpm run start:prod` | Run built app (`dist/`)    |
| `pnpm run gen:prisma` | Generate Prisma client    |
| `pnpm run gen:swagger` | Generate Swagger (Nestia)  |
| `pnpm run lint`   | Lint and fix                   |
| `pnpm run test`   | Unit tests                     |
| `pnpm run test:e2e` | E2E tests                    |

---

## Project structure (high level)

```
src/
├── main.ts                 # Bootstrap, env load, Swagger
├── app.module.ts
├── common/                 # Guards, decorators, strategies
├── libs/                   # Config, JWT, Prisma, Email, Storage
├── modules/
│   ├── auth/
│   ├── user/
│   ├── examIntake/
│   ├── questionCategory/
│   ├── question/
│   └── questionBankPractice/
├── utils/
prisma/
├── schema.prisma           # MongoDB models
```

---

## License

UNLICENSED (private).
