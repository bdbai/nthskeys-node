FROM alpine:latest
MAINTAINER bdbai <htbai1998m@hotmail.com>

ENV NODE_ENV production
ENV FILE_PATH /var/data/nthskeys
ENV BDTJ_ID 7fc10319f4546f2ec0bac6663c745d67
ENV DAOVOICE_ID 64a6c3b8

ADD https://www.j3e.de/linux/convmv/convmv-2.0.tar.gz /tmp/convmv-2.0.tar.gz
RUN apk --no-cache --update add perl nodejs p7zip \
  && tar xf /tmp/convmv-2.0.tar.gz \
  && mv ./convmv-2.0/convmv /usr/bin/convmv \
  && npm install -g webpack

ADD . /app
WORKDIR /app
RUN npm run-script build

VOLUME ["/var/data/nthskeys"]
EXPOSE 9004
CMD ["node", "server.js"]
