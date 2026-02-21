FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm install typescript

# Copy source
COPY tsconfig.json ./
COPY src/ ./src/

# Build TypeScript
RUN npx tsc

# Remove dev dependencies and source
RUN npm prune --production
RUN rm -rf src tsconfig.json

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:${PORT:-3000}/health || exit 1

# Railway sets PORT env var
EXPOSE ${PORT:-3000}

CMD ["node", "dist/index.js"]
