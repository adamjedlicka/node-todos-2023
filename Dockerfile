FROM node:18-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install --omit=dev

COPY . .

FROM node:18-alpine

WORKDIR /app

COPY --from=build /app .

CMD ["node", "main.js"]
