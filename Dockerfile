FROM node:20.11.0-alpine AS deps
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install                               

FROM node:20.11.0-alpine AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
COPY .env /app/.env
RUN yarn build

FROM node:20.11.0-alpine AS runner
WORKDIR /app

RUN apk add --no-cache tzdata \
  && cp /usr/share/zoneinfo/Asia/Bangkok /etc/localtime \
  && echo "Asia/Bangkok" > /etc/timezone \
  && apk del tzdata

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.env ./

EXPOSE 3000
CMD ["node", "dist/main"]