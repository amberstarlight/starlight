FROM node:lts-trixie
ENV NODE_ENV=production \
    YARN_VERSION=4.12.0 \
    PORT=8080

RUN apt-get update && apt-get upgrade -yy && apt-get clean
RUN corepack enable && corepack prepare yarn@${YARN_VERSION}

WORKDIR /opt/starlight
COPY . ./api

WORKDIR /opt/starlight/api
RUN yarn install --immutable
RUN yarn build

EXPOSE 8080
CMD ["yarn", "node", "dist/index.js"]
