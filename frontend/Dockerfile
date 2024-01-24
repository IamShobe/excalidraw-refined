FROM node:18-alpine3.17 as build
WORKDIR /app
COPY . /app

RUN npm install
RUN npm run build

FROM nginx:stable-alpine
LABEL org.opencontainers.image.source="https://github.com/iamshobe/excalidraw-refined_frontend"
COPY config/frontend.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
