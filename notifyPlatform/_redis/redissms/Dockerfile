FROM redis:5

LABEL maintainer="oriol.amat@gmail.com"
LABEL version="1.0"
LABEL description="notifyPlatform redis for SMS"

# Install redis.conf
COPY redis.conf /usr/local/etc/redis/redis.conf

ENV NODE_ENV docker

# If you are building your code for production
# RUN npm install --only=production

EXPOSE 30080

#CMD [ "redis-server", "--port", "30080"]
CMD [ "redis-server", "/usr/local/etc/redis/redis.conf" ]
