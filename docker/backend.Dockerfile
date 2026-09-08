# Production Dockerfile for Intelligent DevSecOps Platform Backend
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency definitions
COPY package*.json tsconfig.json ./

# Install dependencies
RUN npm ci

# Copy source files
COPY server.ts ./
COPY src/ ./src/
COPY backend/ ./backend/

# Build client and bundle backend server into dist/server.cjs
RUN npm run build

# Runtime stage
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Copy built assets from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Install production only dependencies
RUN npm ci --only=production

EXPOSE 3000

CMD ["node", "dist/server.cjs"]
