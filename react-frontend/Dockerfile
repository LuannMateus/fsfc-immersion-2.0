FROM node:12.14.0-alpine3.11

RUN apk add --no-cache bash

USER node

RUN mkdir -p /home/node/app

WORKDIR /home/node/app

COPY . .