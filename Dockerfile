FROM node:carbon-alpine

WORKDIR /home/node/app

ENV DEBUG=hostlab:*
ENV PORT=8080
EXPOSE 8080
EXPOSE 5858

CMD ["npm", "start"]

RUN npm install -g nodemon

#COPY . .
#RUN chown --recursive node /home/node

# Gruppe für gemountetes volume
RUN adduser node ping

USER node
#RUN npm install
