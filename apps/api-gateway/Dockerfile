FROM node:22-alpine

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy workspace configuration and root package.json
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy all package.json files first
COPY apps/api-gateway/package.json ./apps/api-gateway/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies first (this will use the lockfile)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/api-gateway ./apps/api-gateway
COPY packages/shared ./packages/shared

# Build the application
WORKDIR /app/apps/api-gateway
RUN pnpm run build

# Install production dependencies in the service directory
RUN pnpm install --prod --frozen-lockfile

WORKDIR /app/apps/api-gateway

EXPOSE 3000

CMD ["node", "dist/main"]