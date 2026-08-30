# ==========================================
# Multi-stage Dockerfile for Booth Lead Capture
# ==========================================

# Stage 1: Build Frontend (React 19 + Vite)
FROM node:22-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Stage 2: Build Backend Server (Express + TypeScript)
FROM node:22-alpine AS server-builder
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci
COPY server/ ./
RUN npm run build

# Stage 3: Production Runner
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001
ENV DATA_DIR=/app/data

# Copy server dependencies and built code
COPY server/package*.json ./
RUN npm ci --omit=dev

COPY --from=server-builder /app/server/dist ./dist
# Copy built frontend assets into server's dist for static serving
COPY --from=client-builder /app/client/dist ./client_dist

# Create persistent data directory volume
RUN mkdir -p /app/data
VOLUME ["/app/data"]

EXPOSE 3001

CMD ["node", "dist/index.js"]
