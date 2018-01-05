FROM node:carbon-alpine

ENV PORT=3000
ENV APPDIR=/app

EXPOSE ${PORT}

WORKDIR ${APPDIR}
RUN npm install -g nodemon gulp
COPY . .


RUN npm install && npm run-script compile


CMD ["nodemon", "-L", "./bin/www"]
