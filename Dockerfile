# multi stage 🚀

FROM node:16.10-alpine3.11 AS build
WORKDIR /app
COPY ./ /app/
RUN yarn install
RUN yarn build

FROM nginx:stable-alpine AS production
COPY --from=build /app/build /usr/share/nginx/html
COPY .nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
