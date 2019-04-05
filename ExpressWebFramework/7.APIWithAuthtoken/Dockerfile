FROM node:8

LABEL maintainer="oriol.amat@gmail.com"
LABEL version="1.0"
LABEL description="node api rest image test"

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# Bundle app source
COPY . . 

ENV MONGO_URL: mongodb://root:example@mongo:27017/admin?authMechanism=SCRAM-SHA-1
ENV MONGO_INITDB_ROOT_USERNAME root
ENV MONGO_INITDB_ROOT_PASSWORD example
ENV MONGO_INITDB_DATABASE test
ENV NODE_ENV docker

RUN chmod -R 755 /usr/src/app

RUN npm install
# If you are building your code for production
# RUN npm install --only=production



EXPOSE 3000

CMD [ "npm", "start" ]