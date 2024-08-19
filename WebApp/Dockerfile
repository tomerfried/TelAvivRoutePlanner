FROM node:22-alpine

WORKDIR /usr/src

COPY public/ /usr/public
COPY src/ /usr/src
COPY package.json /usr

RUN npm install

CMD ["npm", "start"]