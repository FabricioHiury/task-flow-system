FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/task-service/package*.json ./apps/task-service/

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY apps/task-service ./apps/task-service
COPY packages ./packages

# Build the application
WORKDIR /app/apps/task-service
RUN npm run build

EXPOSE 3002

CMD ["npm", "run", "start:prod"]