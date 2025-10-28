FROM node:22-alpine

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy workspace configuration and root package.json
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy all package.json files first
COPY apps/notification-service/package.json ./apps/notification-service/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies first (this will use the lockfile)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/notification-service ./apps/notification-service
COPY packages/shared ./packages/shared

# Build the application
WORKDIR /app/apps/notification-service
RUN pnpm run build

# Install production dependencies in the service directory
RUN pnpm install --prod --frozen-lockfile

WORKDIR /app/apps/notification-service

EXPOSE 3002

CMD ["node", "dist/main"]