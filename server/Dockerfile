
FROM node:24-alpine AS dependencies
WORKDIR /usr/app
COPY package*.json ./
RUN ["npm", "ci"]
COPY src ./src
COPY tsconfig*.json ./
RUN ["npm", "run", "build:prd"]

FROM node:24-alpine
WORKDIR /usr/app
COPY --from=dependencies /usr/app/dist ./
COPY --from=dependencies /usr/app/package*.json ./
RUN ["npm", "ci", "--omit=dev"]
USER node
EXPOSE 4000
CMD ["node", "src/infrastructure/http_server/server.js"]
