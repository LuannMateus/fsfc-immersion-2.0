FROM node:12.14.0-alpine3.11

RUN apk add --no-cache bash

RUN npm install -g @nestjs/cli@7.5.6

USER node

RUN mkdir -p /home/node/app

WORKDIR /home/node/app

COPY . .