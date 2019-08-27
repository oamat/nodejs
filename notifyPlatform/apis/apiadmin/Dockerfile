FROM node:8

LABEL maintainer="oriol.amat@gmail.com"
LABEL version="1.0"
LABEL description="notifyPlatform module test"

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# Bundle app source
COPY . . 

ENV NODE_ENV docker

RUN chmod -R 755 /usr/src/app

RUN npm install
# If you are building your code for production
# RUN npm install --only=production

EXPOSE 30003

CMD [ "node", "index.js" ]