FROM node:carbon-alpine

# set working directory
WORKDIR /usr/src/hostlab
# Copy important stuff.
COPY package.json yarn.lock ./
# Install dependencies
RUN apk add --update \
	&& apk add --no-cache --virtual .build-deps git curl python g++ make \
		# Install node.js dependencies
		# && yarn install \
		&& yarn install --production \
		# Clean up build dependencies
		&& apk del .build-deps
		
# Copy, build, and run
COPY src .

CMD ["node", "./bin/www"]
