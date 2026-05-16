
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

# Build
# docker build -t server .

# Run
# docker run -it --rm \
#   --name server \
#   --publish=4000:80 \
#   --network=typescript_web_server_mynetwork \
#   --env=CORS_ALLOWED_ORIGINS=http://localhost:5173 \
#   --env=DATABASE_CONNECTIONS_NUMBER=4 \
#   --env=DATABASE_DB=database \
#   --env=DATABASE_HOST=database \
#   --env=DATABASE_PASSWORD=postgres \
#   --env=DATABASE_PORT=5432 \
#   --env=DATABASE_TIMEOUT=300000 \
#   --env=DATABASE_USER=postgres \
#   --env=RUST_ENV=production \
#   --env=RUST_LOG=info \
#   --env=SERVER_HOST=0.0.0.0 \
#   --env=SERVER_NAME=server \
#   --env=SERVER_PORT=80 \
#   server