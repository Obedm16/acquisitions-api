# syntax=docker/dockerfile:1

# ---- Base image ----
FROM node:20-alpine AS base
WORKDIR /app
ENV NODE_ENV=production

# Install dependencies only when needed
FROM base AS deps
# Install OS deps if needed (uncomment for native deps)
# RUN apk add --no-cache python3 make g++

# Copy manifests and install deps
COPY package*.json ./
RUN --mount=type=cache,id=npm-cache,target=/root/.npm \
    npm ci --omit=dev

# ---- Development deps (optional stage) ----
FROM base AS devdeps
COPY package*.json ./
RUN --mount=type=cache,id=npm-cache,target=/root/.npm \
    npm ci

# ---- Production runtime ----
FROM base AS runtime
# Use existing node user from base image
USER node

# Copy node_modules from deps stage
COPY --from=deps --chown=node:node /app/node_modules ./node_modules

# Copy application source
COPY --chown=node:node . .

# Default port (can be overridden by PORT env)
EXPOSE 4001

# Start command
CMD ["node", "src/index.js"]
