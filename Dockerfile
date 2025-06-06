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

# Environment variables passed during build
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

ARG COURSERA_API_KEY
ENV COURSERA_API_KEY=$COURSERA_API_KEY

ARG COURSERA_API_URL
ENV COURSERA_API_URL=$COURSERA_API_URL

ARG YOUTUBE_API_KEY
ENV YOUTUBE_API_KEY=$YOUTUBE_API_KEY

ARG YOUTUBE_API_URL
ENV YOUTUBE_API_URL=$YOUTUBE_API_URL

ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

ARG CLERK_SECRET_KEY
ENV CLERK_SECRET_KEY=$CLERK_SECRET_KEY

ARG GEMINI_API_KEY
ENV GEMINI_API_KEY=$GEMINI_API_KEY

ARG RAZORPAY_KEY_SECRET
ENV RAZORPAY_KEY_SECRET=$RAZORPAY_KEY_SECRET

ARG RAZORPAY_KEY_ID
ENV RAZORPAY_KEY_ID=$RAZORPAY_KEY_ID

ARG DEFAULT_RAZORPAY_PLAN_ID
ENV DEFAULT_RAZORPAY_PLAN_ID=$DEFAULT_RAZORPAY_PLAN_ID

ARG HUGGING_FACE_API_TOKEN
ENV HUGGING_FACE_API_TOKEN=$HUGGING_FACE_API_TOKEN

ARG OPENROUTER_API_KEY
ENV OPENROUTER_API_KEY=$OPENROUTER_API_KEY

# Copy Prisma schema first to take advantage of Docker cache
COPY prisma ./prisma

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Generate Prisma client
RUN npx prisma generate

# Copy rest of the code
COPY . .

# Build the app
RUN npm run build

# Expose Next.js port
EXPOSE 3000

# Run the app
CMD ["npm", "run", "start"]
