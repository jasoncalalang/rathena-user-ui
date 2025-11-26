# Stage 1: Build React app
FROM node:alpine3.21 AS builder
WORKDIR /app

# Copy client package files
COPY client/package*.json ./client/
WORKDIR /app/client
RUN npm ci

# Copy client source and build
COPY client/ ./
RUN npm run build

# Stage 2: Production Express server
FROM node:alpine3.21
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs \
    && adduser -S nodejs -u 1001

# Copy server package files and install dependencies
COPY server/package*.json ./
RUN npm ci --only=production

# Copy server code
COPY server/app.js server/index.js ./

# Copy built React app
COPY --from=builder /app/client/dist ./public

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/health || exit 1

# Set ownership and switch to non-root user
RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 3001

ENV NODE_ENV=production
ENV PORT=3001

CMD ["node", "index.js"]
