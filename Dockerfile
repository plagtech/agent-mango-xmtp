FROM node:20-slim

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY tsconfig.json ./
COPY src/ ./src/

RUN npx tsc

RUN npm prune --production
RUN rm -rf src tsconfig.json

EXPOSE ${PORT:-3000}

CMD ["node", "dist/index.js"]