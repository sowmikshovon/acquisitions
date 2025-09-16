# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a Node.js Express API called "acquisitions" that provides authentication services. It uses:
- **Express 5.x** for the web framework
- **Drizzle ORM** with PostgreSQL (Neon Database) for data persistence
- **JWT** for authentication tokens
- **Zod** for input validation
- **Winston** for structured logging
- **bcrypt** for password hashing

## Development Commands

### Core Development
- `npm run dev` - Start development server with file watching (uses Node.js --watch)
- `npm run lint` - Run ESLint to check code quality
- `npm run lint:fix` - Auto-fix ESLint issues where possible
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check if code needs formatting

### Database Operations
- `npm run db:generate` - Generate database migration files from schema changes
- `npm run db:migrate` - Apply pending migrations to database
- `npm run db:studio` - Open Drizzle Studio for database management

## Architecture Overview

### Module Import System
The project uses ES modules with custom import path mapping defined in `package.json`:
- `#config/*` → `./src/config/*`
- `#controllers/*` → `./src/controllers/*`
- `#middleware/*` → `./src/middleware/*`
- `#models/*` → `./src/models/*`
- `#routes/*` → `./src/routes/*`
- `#services/*` → `./src/services/*`
- `#utils/*` → `./src/utils/*`
- `#validation/*` → `./src/validation/*`

### Application Structure
- **Entry Point**: `src/index.js` → `src/server.js` → `src/app.js`
- **Database**: Drizzle ORM with Neon PostgreSQL serverless
- **Authentication**: JWT tokens stored in HTTP-only cookies
- **Logging**: Winston with file-based logging (`logs/` directory)
- **Validation**: Zod schemas for request validation

### Key Components
- **Models**: Database schemas using Drizzle's `pgTable` (currently only `users` table)
- **Services**: Business logic layer (auth.service.js handles user creation and password hashing)
- **Controllers**: Request/response handling with validation and error management
- **Routes**: Express route definitions
- **Utils**: Shared utilities (JWT handling, cookie management, validation formatting)

### Database Schema
- **Users table**: id, name, email (unique), password (hashed), role, timestamps
- **Migrations**: Stored in `drizzle/` directory
- **Configuration**: `drizzle.config.js` points to PostgreSQL via `DATABASE_URL`

### Security Features
- **Helmet** for security headers
- **CORS** enabled
- **bcrypt** for password hashing (salt rounds: 10)
- **JWT** tokens with 1-day expiration
- **HTTP-only cookies** with secure flags in production

## Environment Setup

Required environment variables:
- `DATABASE_URL` - Neon PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret (defaults to development value)
- `NODE_ENV` - Environment mode (affects cookie security and console logging)
- `PORT` - Server port (defaults to 3000)
- `LOG_LEVEL` - Winston log level (defaults to 'info')

## Code Style and Configuration

### ESLint Rules
- 2-space indentation
- Single quotes
- Semicolons required
- Unix line endings
- Arrow functions preferred
- No unused variables (except prefixed with `_`)

### Prettier Configuration
- Single quotes, semicolons, trailing commas (ES5)
- 80 character line width, 2-space indentation

## Current API Endpoints

- `GET /` - Basic health check
- `GET /health` - Detailed health status with uptime
- `GET /api` - API status check
- `POST /api/auth/sign-up` - User registration (implemented)
- `POST /api/auth/sign-in` - User login (placeholder)
- `POST /api/auth/sign-out` - User logout (placeholder)

## Testing

No test framework is currently configured. When adding tests, consider:
- ESLint config already includes Jest globals in `tests/**/*.js` files
- Common choices would be Jest, Vitest, or Mocha

## Development Notes

- The project uses ES modules (`"type": "module"`)
- Password validation requires minimum 6 characters
- User roles are enum: 'user' (default) or 'admin'
- Logging outputs to both files and console in non-production environments
- Database migrations should be generated after schema changes in `src/models/`