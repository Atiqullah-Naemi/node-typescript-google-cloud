FROM node:14.9

WORKDIR /user/src/app

COPY package*.json ./

RUN yarn

COPY . .

RUN yarn build

COPY .env ./dist

WORKDIR ./dist

EXPOSE 8080

CMD node src/app.js