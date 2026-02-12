# -------- Base image --------
FROM node:20-bullseye-slim

ENV DEBIAN_FRONTEND=noninteractive
ENV NODE_ENV=production

# Install required dependencies for Chrome
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libgbm1 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libxss1 \
    libxtst6 \
    wget \
    gnupg \
 && rm -rf /var/lib/apt/lists/*

# Install Google Chrome
RUN wget -q https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb \
 && apt-get update \
 && apt-get install -y ./google-chrome-stable_current_amd64.deb \
 && rm google-chrome-stable_current_amd64.deb \
 && rm -rf /var/lib/apt/lists/*

# Tell Puppeteer to use system Chrome
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# Create app directory
WORKDIR /usr/src/app

# Copy package files first (better cache)
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy application source
COPY . .

# Copy environment file explicitly
COPY .env .env

EXPOSE 3000

CMD ["node", "main.js"]