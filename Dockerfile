FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Fix the dotenv config to use standard .env
RUN sed -i "s/dotenv.config({ path: '.env.server' });/dotenv.config();/" server.js

EXPOSE 3001

CMD ["node", "server.js"]