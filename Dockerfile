FROM alpine:latest
MAINTAINER bdbai <htbai1998m@hotmail.com>

ENV NODE_ENV production
ENV FILE_PATH /var/data/nthskeys
ENV BDTJ_ID 909044fbc84468a4ab64fc9544d428ea

RUN apk --no-cache --update add nodejs p7zip \
  && npm install -g webpack

ADD . /app
WORKDIR /app
RUN npm run-script build

VOLUME ["/var/data/nthskeys"]
EXPOSE 9004
CMD ["node", "server.js"]
