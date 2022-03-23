# syntax=docker/dockerfile:1
FROM node:14
WORKDIR /datatools-build
COPY package.json yarn.lock ./
RUN yarn
COPY . ./
RUN yarn build

FROM nginx
COPY --from=node /datatools-build/dist /var/share/nginx/html/
EXPOSE 80