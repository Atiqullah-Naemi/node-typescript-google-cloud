FROM node:14.9

WORKDIR /user/src/app

COPY package*.json ./
COPY tsconfig.json ./
COPY .env ./

RUN yarn

COPY . .
RUN yarn build



# stage 2
FROM node:14.9

WORKDIR /user/src/app

COPY package*.json ./
COPY tsconfig.json ./
COPY .env ./

RUN yarn
COPY --from=build /usr/src/app/dist ./

RUN yarn add pm2 -g

COPY . .

EXPOSE 3000

CMD ["pm2-runtime","app.js"]