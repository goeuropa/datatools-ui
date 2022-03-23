# syntax=docker/dockerfile:1
FROM node:14
WORKDIR /datatools-build
RUN cd /datatools-build
COPY package.json yarn.lock /datatools-build/
RUN yarn
COPY . /datatools-build/ 
COPY configurations/default /datatools-config/
RUN yarn run build --minify -c /datatools-config

FROM nginx
COPY --from=0 /datatools-build/dist /usr/share/nginx/html/dist/
EXPOSE 80