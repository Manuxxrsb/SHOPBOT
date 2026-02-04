FROM node:20-bullseye-slim

# Install dependencies for Chrome
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates wget gnupg fonts-liberation libappindicator3-1 libasound2 \
    libatk-bridge2.0-0 libatk1.0-0 libcups2 libdbus-1-3 libgdk-pixbuf2.0-0 \
    libnspr4 libnss3 libx11-xcb1 libxcomposite1 libxdamage1 libxrandr2 \
    libxss1 libxtst6 lsb-release xdg-utils libgbm1 \
 && rm -rf /var/lib/apt/lists/*

# Download and install Google Chrome
RUN wget -q -O /tmp/google-chrome-stable_current_amd64.deb \
    https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb \
 && apt-get update \
 && apt-get install -y --no-install-recommends /tmp/google-chrome-stable_current_amd64.deb || apt-get -f install -y \
 && rm -f /tmp/google-chrome-stable_current_amd64.deb \
 && rm -rf /var/lib/apt/lists/*

# Set Puppeteer env var
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# Create app directory
WORKDIR /usr/src/app

# Copy package files and install dependencies first for better caching
COPY package.json package-lock.json* ./
RUN npm install

# Copy app source
COPY . .

# Expose port
EXPOSE 3000

# Start the app
CMD ["node", "main.js"]
