FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY tsconfig.json ./
COPY src/ ./src/

RUN npx tsc

EXPOSE ${PORT:-3000}

CMD ["node", "dist/index.js"]