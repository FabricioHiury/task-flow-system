FROM node:22-alpine

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/web ./apps/web
COPY packages ./packages

# Build the application
WORKDIR /app/apps/web
RUN pnpm run build

# Install serve globally for production serving
RUN npm install -g serve

# Go back to root and expose port
WORKDIR /app/apps/web

EXPOSE 4173

# Use serve to serve the built files instead of vite preview
CMD ["serve", "-s", "dist", "-l", "4173"]