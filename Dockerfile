FROM node:carbon-alpine

ENV DEBUG=hostlab:*
ENV PORT=8080
ENV APPDIR=/app

EXPOSE ${PORT}

WORKDIR ${APPDIR}
RUN npm install -g nodemon gulp
COPY . .

RUN chown -R node:node ${APPDIR} && chmod -R g+rw ${APPDIR}
USER node:node

RUN npm install && npm run-script compile

HEALTHCHECK --interval=1m --timeout=5s CMD curl -f http://localhost:8080 || exit 1

CMD ["npm", "start"]