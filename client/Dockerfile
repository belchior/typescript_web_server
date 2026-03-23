
FROM node:24-alpine AS dependencies
WORKDIR /usr/app
COPY package*.json ./
RUN ["npm", "ci"]
COPY . ./
ARG SERVER_URL
ENV VITE_SERVER_URL=${SERVER_URL}
ENV CI=true
RUN ["npm", "run", "build"]

FROM nginx:alpine
WORKDIR /usr/share/nginx/html
COPY --from=dependencies /usr/app/dist ./
COPY --from=dependencies /usr/app/nginx.conf /etc/nginx/
ARG SERVER_PROXY_PASS
RUN if [ "$SERVER_PROXY_PASS" ]; then sed -i -e "s|#SERVER_PROXY_PASS|${SERVER_PROXY_PASS}|" /etc/nginx/nginx.conf; fi

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# To build and run
# docker build -t client --build-arg SERVER_URL=http://localhost:4000 .
# docker run --rm -it -p ${CLIENT_PORT}:80 client:latest