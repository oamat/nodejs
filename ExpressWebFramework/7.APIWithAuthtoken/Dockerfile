FROM node:8

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# Bundle app source
COPY . . 

RUN chmod -R 755 /usr/src/app

RUN npm install
# If you are building your code for production
# RUN npm install --only=production



EXPOSE 8080

CMD [ "npm", "start" ]