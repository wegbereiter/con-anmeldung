FROM node:22-alpine as build
ENV NODE_ENV=development
ENV TZ=Europe/Berlin
WORKDIR /usr/src/app

COPY package.json .
COPY package-lock.json .
RUN npm ci --force

COPY . .
RUN npm run build

FROM node:22-alpine as app
ENV NODE_ENV=production
ENV TZ=Europe/Berlin
WORKDIR /usr/src/app

COPY server/package.json .
COPY server/package-lock.json .
RUN npm ci --force

COPY server/. .
COPY --from=build /usr/src/app/dist frontend/

EXPOSE 80

CMD ["node", ".", "-d frontend"]
