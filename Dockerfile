FROM node:14-alpine as build
ENV NODE_ENV=development
ENV TZ=Europe/Berlin
WORKDIR /usr/src/app

COPY package.json .
COPY package-lock.json .
RUN npm ci

COPY . .
RUN npm run build

FROM node:14-alpine as app
ENV NODE_ENV=production
ENV TZ=Europe/Berlin
WORKDIR /usr/src/app

COPY server/package.json .
COPY server/package-lock.json .
RUN npm ci

COPY server/. .
COPY --from=build /usr/src/app/dist frontend/

CMD ["node", ".", "-d frontend"]
