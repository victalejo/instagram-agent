# Use Node.js 18 with Ubuntu base for better compatibility with Puppeteer
FROM node:18-bullseye-slim

# Set working directory
WORKDIR /app

# Install system dependencies required for Puppeteer and Chrome
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    procps \
    libxss1 \
    libgconf-2-4 \
    libxrandr2 \
    libasound2 \
    libpangocairo-1.0-0 \
    libatk1.0-0 \
    libcairo-gobject2 \
    libgtk-3-0 \
    libgdk-pixbuf2.0-0 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrender1 \
    libxtst6 \
    libglib2.0-0 \
    libnss3 \
    libnspr4 \
    libxss1 \
    libdrm2 \
    libxkbcommon0 \
    libatspi2.0-0 \
    libgtk-3-0 \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libdrm2 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libxss1 \
    libgconf-2-4 \
    --no-install-recommends

# Create a user to run the application (security best practice)
RUN groupadd -r pptruser && useradd -r -g pptruser -G audio,video pptruser \
    && mkdir -p /home/pptruser/Downloads /app \
    && chown -R pptruser:pptruser /home/pptruser \
    && chown -R pptruser:pptruser /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Install Puppeteer and download Chromium
RUN npm install puppeteer

# Copy application code
COPY . .

# Create necessary directories with proper permissions
RUN mkdir -p /app/cookies /app/build && \
    chown -R pptruser:pptruser /app

# Set Puppeteer to skip downloading Chromium (we'll use system installed)
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# Install Google Chrome stable
RUN wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*

# Build the TypeScript application
RUN npm run build || npm run tsc || npx tsc

# Switch to non-root user
USER pptruser

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PUPPETEER_ARGS=--no-sandbox,--disable-setuid-sandbox,--disable-dev-shm-usage,--disable-accelerated-2d-canvas,--no-first-run,--no-zygote,--disable-gpu

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Start the application
CMD ["npm", "start"]