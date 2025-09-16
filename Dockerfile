# Multi-stage Dockerfile for acquisitions API
# Stage 1: Base image with Node.js
FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy package files
COPY package*.json ./

# Stage 2: Dependencies installation
FROM base AS deps

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Stage 3: Development dependencies (for build tools)
FROM base AS deps-dev

# Install all dependencies (including devDependencies)
RUN npm ci

# Stage 4: Development environment
FROM base AS development

# Install curl for healthchecks
RUN apk add --no-cache curl

# Copy all dependencies
COPY --from=deps-dev /app/node_modules ./node_modules

# Copy source code
COPY --chown=nodejs:nodejs . .

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start development server with file watching
CMD ["npm", "run", "dev"]

# Stage 5: Production build
FROM base AS production

# Install curl for healthchecks
RUN apk add --no-cache curl

# Copy production dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY --chown=nodejs:nodejs . .

# Create logs directory
RUN mkdir -p logs && chown nodejs:nodejs logs

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start production server
CMD ["node", "src/index.js"]
