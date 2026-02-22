FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY tsconfig.json ./
COPY src/ ./src/

RUN npx tsc

# Create data directory for XMTP SQLite database
# Railway volumes mount here when configured
RUN mkdir -p /data && chmod 777 /data

EXPOSE ${PORT:-3000}

CMD ["node", "dist/index.js"]