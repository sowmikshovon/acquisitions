# Docker Setup for Acquisitions API

This document provides comprehensive instructions for running the Acquisitions API using Docker with different configurations for development and production environments.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Development Environment](#development-environment)
- [Production Environment](#production-environment)
- [Docker Commands Reference](#docker-commands-reference)
- [Troubleshooting](#troubleshooting)

## Overview

The Acquisitions API is containerized with Docker, supporting two main environments:

- **Development**: Uses Neon Local proxy for ephemeral database branches
- **Production**: Connects directly to Neon Cloud database

### Architecture

```
Development:
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Application   │───▶│   Neon Local    │───▶│   Neon Cloud    │
│   (Container)   │    │    (Proxy)      │    │   (Database)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘

Production:
┌─────────────────┐                           ┌─────────────────┐
│   Application   │──────────────────────────▶│   Neon Cloud    │
│   (Container)   │                           │   (Database)    │
└─────────────────┘                           └─────────────────┘
```

## Prerequisites

- Docker and Docker Compose installed
- Neon account with API key and project ID
- Node.js 20+ (for local development without Docker)

## Environment Configuration

### Required Environment Variables

Create the following files based on your environment:

#### For Development (.env.development)

```env
# Development Environment Configuration
DATABASE_URL=postgres://neondb_owner:localpass@neon-local:5432/neondb
NODE_ENV=development
PORT=3000
JWT_SECRET=dev-secret-key-change-in-production
LOG_LEVEL=debug

# Neon Local Configuration
NEON_API_KEY=your_neon_api_key_here
NEON_PROJECT_ID=your_neon_project_id_here
# BRANCH_ID=your_branch_id_here (optional - creates ephemeral branch if not specified)
```

#### For Production (.env.production)

```env
# Production Environment Configuration
DATABASE_URL=postgres://username:password@ep-example-123456.us-east-1.aws.neon.tech/neondb?sslmode=require
NODE_ENV=production
PORT=3000
JWT_SECRET=your-super-secure-jwt-secret-here
LOG_LEVEL=info
```

### Setting Up Neon Credentials

1. Get your Neon API key from the [Neon Console](https://console.neon.tech)
2. Find your project ID in your Neon project dashboard
3. Optional: Get a specific branch ID if you want to connect to an existing branch

## Development Environment

### Quick Start

1. **Set up environment variables:**

   ```bash
   # Copy and edit the development environment file
   cp .env.example .env.development
   # Edit .env.development with your Neon credentials
   ```

2. **Start the development environment:**

   ```bash
   # Using npm script
   npm run docker:dev

   # Or using docker-compose directly
   docker-compose -f docker-compose.dev.yml up --build
   ```

3. **Access the application:**
   - Application: http://localhost:3000
   - Health check: http://localhost:3000/health
   - API endpoint: http://localhost:3000/api

### Development Features

- **Hot Reload**: Source code is mounted as a volume for real-time changes
- **Ephemeral Database**: Neon Local creates temporary branches for isolated development
- **Debug Logging**: Enhanced logging for development debugging
- **Health Checks**: Built-in container health monitoring

### Development Workflow

```bash
# Start development environment
npm run docker:dev

# View logs
npm run docker:logs

# View app-specific logs
npm run docker:logs:app

# Stop development environment
npm run docker:dev:down

# Clean up Docker resources
npm run docker:clean
```

### Database Management in Development

```bash
# Generate database migrations (run inside container or locally)
docker-compose -f docker-compose.dev.yml exec app npm run db:generate

# Apply migrations
docker-compose -f docker-compose.dev.yml exec app npm run db:migrate

# Open Drizzle Studio
docker-compose -f docker-compose.dev.yml exec app npm run db:studio
```

## Production Environment

### Quick Start

1. **Set up environment variables:**

   ```bash
   # Copy and edit the production environment file
   cp .env.example .env.production
   # Edit .env.production with your production Neon Cloud URL
   ```

2. **Start the production environment:**

   ```bash
   # Using npm script (runs in detached mode)
   npm run docker:prod

   # Or using docker-compose directly
   docker-compose -f docker-compose.prod.yml up --build -d
   ```

3. **Verify deployment:**

   ```bash
   # Check container status
   docker-compose -f docker-compose.prod.yml ps

   # Check health
   curl http://localhost:3000/health
   ```

### Production Features

- **Optimized Build**: Multi-stage Docker build for smaller production images
- **Security**: Non-root user, minimal attack surface
- **Resource Limits**: Memory limits and health checks
- **Persistent Logging**: Logs stored in Docker volumes
- **Optional Nginx**: Reverse proxy support (see nginx profile)

### Production Deployment

```bash
# Deploy with environment variables from file
env $(cat .env.production | xargs) docker-compose -f docker-compose.prod.yml up -d

# Or export variables first
export $(cat .env.production | xargs)
docker-compose -f docker-compose.prod.yml up -d

# Check logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop production environment
npm run docker:prod:down
```

### Production with Nginx (Optional)

To run with the nginx reverse proxy:

```bash
# Create nginx configuration file (nginx.conf)
# Start with nginx profile
docker-compose -f docker-compose.prod.yml --profile with-proxy up -d
```

## Docker Commands Reference

### Build Commands

```bash
# Build for development
npm run docker:build:dev
docker build --target development .

# Build for production
npm run docker:build:prod
docker build --target production .

# Build both stages
npm run docker:build
docker build .
```

### Development Commands

```bash
# Start development environment
npm run docker:dev
docker-compose -f docker-compose.dev.yml up --build

# Stop development environment
npm run docker:dev:down
docker-compose -f docker-compose.dev.yml down
```

### Production Commands

```bash
# Start production environment
npm run docker:prod
docker-compose -f docker-compose.prod.yml up --build -d

# Stop production environment
npm run docker:prod:down
docker-compose -f docker-compose.prod.yml down
```

### Logging Commands

```bash
# View all container logs
npm run docker:logs
docker-compose logs -f

# View application logs only
npm run docker:logs:app
docker-compose logs -f app
```

### Utility Commands

```bash
# Clean up Docker resources
npm run docker:clean
docker system prune -f && docker volume prune -f

# Execute commands in running container
docker-compose exec app bash
docker-compose exec app npm run db:migrate
```

## Troubleshooting

### Common Issues

#### 1. Neon Local Connection Issues

```bash
# Check if Neon Local container is healthy
docker-compose -f docker-compose.dev.yml ps

# View Neon Local logs
docker-compose -f docker-compose.dev.yml logs neon-local

# Verify environment variables
docker-compose -f docker-compose.dev.yml exec app env | grep NEON
```

#### 2. Database Connection Errors

```bash
# Test database connectivity
docker-compose -f docker-compose.dev.yml exec app npx drizzle-kit introspect

# Check database URL format
echo $DATABASE_URL
```

#### 3. Container Health Check Failures

```bash
# Check container health status
docker inspect acquisitions-app-dev | jq '.[0].State.Health'

# Manually test health endpoint
docker-compose exec app curl -f http://localhost:3000/health
```

#### 4. Build Issues

```bash
# Clean build cache
docker builder prune -f

# Build with no cache
docker-compose build --no-cache

# Check Dockerfile syntax
docker build --no-cache --progress=plain .
```

### Environment Debugging

```bash
# Check all environment variables in container
docker-compose exec app env

# Test specific environment values
docker-compose exec app echo $DATABASE_URL
docker-compose exec app echo $NODE_ENV
```

### Network Issues

```bash
# List Docker networks
docker network ls

# Inspect the acquisitions network
docker network inspect acquisitions_acquisitions-network

# Test connectivity between containers
docker-compose exec app ping neon-local
```

### Performance Monitoring

```bash
# Monitor container resources
docker stats

# Check container processes
docker-compose exec app ps aux

# View container resource limits
docker inspect acquisitions-app-dev | jq '.[0].HostConfig.Memory'
```

## Best Practices

### Development

- Always use `.env.development` for local development
- Keep Neon API credentials secure and never commit them
- Use ephemeral branches for isolated feature development
- Monitor container logs for development debugging

### Production

- Use strong, unique secrets for `JWT_SECRET`
- Set appropriate `LOG_LEVEL` (info or warn)
- Monitor container health and resource usage
- Implement proper backup strategies for persistent data
- Use Docker secrets or external secret management in orchestration platforms

### Security

- Never commit environment files with real credentials
- Use non-root users in containers (already configured)
- Keep Docker images updated with security patches
- Implement proper network segmentation in production environments

---

For more information about the Acquisitions API, see the main [README.md](README.md) file.
