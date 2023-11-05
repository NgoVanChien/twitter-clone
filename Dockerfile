FROM node:20-alpine3.17

WORKDIR /app

COPY package.json .
COPY package-lock.json .
COPY tsconfig.json .
COPY ecosystem.config.cjs .
COPY .env.production .
COPY ./src ./src
COPY ./openapi ./openapi

RUN apk add --no-cache ffmpeg
RUN apk add python3
RUN npm install pm2 -g
RUN npm install
RUN npm run build

EXPOSE 3000

CMD ["pm2-runtime", "start", "ecosystem.config.cjs", "--env", "production"]