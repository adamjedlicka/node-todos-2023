FROM node:18 AS build

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install --omit=dev

COPY . .

FROM node:18

WORKDIR /app

COPY --from=build /app .

CMD ["node", "main.js"]
