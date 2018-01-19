FROM node:carbon-alpine
WORKDIR /app
RUN npm install -g nodemon
CMD ["nodemon", "-L", "./bin/www"]
