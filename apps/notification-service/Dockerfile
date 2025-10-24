FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/notification-service/package*.json ./apps/notification-service/

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY apps/notification-service ./apps/notification-service
COPY packages ./packages

# Build the application
WORKDIR /app/apps/notification-service
RUN npm run build

EXPOSE 3001

CMD ["npm", "run", "start:prod"]