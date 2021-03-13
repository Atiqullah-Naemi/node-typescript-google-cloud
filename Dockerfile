FROM node:14.9

WORKDIR /user/app

COPY ./package.json ./

RUN yarn install

COPY ./ ./

RUN yarn build

EXPOSE 8080

CMD ["yarn", "start"]