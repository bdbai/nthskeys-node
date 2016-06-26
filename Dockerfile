FROM alpine:latest
MAINTAINER bdbai <htbai1998m@hotmail.com>

ENV NODE_ENV production
ENV FILE_PATH /var/data/nthskeys

RUN apk --no-cache --update add nodejs

ADD . /app
WORKDIR /app
RUN npm install

VOLUME ["/var/data/nthskeys"]
EXPOSE 9004
CMD ["node", "server.js"]
