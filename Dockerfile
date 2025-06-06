# Use Node base image
FROM node:18-slim

# Install Chromium dependencies for Puppeteer
RUN apt-get update && apt-get install -y \
    chromium \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libgdk-pixbuf2.0-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    wget \
    --no-install-recommends && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Set Prisma env (for build time)
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

# Copy Prisma schema first
COPY prisma ./prisma

# Copy package files first and install deps
COPY package*.json ./
RUN npm install

# Generate Prisma client before build
RUN npx prisma generate

# Then copy the rest of your app
COPY . .

# Build the nextjs
RUN npm run build

# Expose Next.js default port
EXPOSE 3000

# Run the app
CMD ["npm", "run", "start"]
