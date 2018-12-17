FROM node:8

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

RUN chmod -R 755 /usr/src/app

RUN npm install
# If you are building your code for production
# RUN npm install --only=production



EXPOSE 3000

CMD [ "npm", "start" ]