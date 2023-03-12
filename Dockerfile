FROM node:18-slim

WORKDIR /app

COPY ./package.json ./

RUN npm install

COPY ./bin ./

CMD node index.js