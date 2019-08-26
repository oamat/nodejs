FROM redis:5

LABEL maintainer="oriol.amat@gmail.com"
LABEL version="1.0"
LABEL description="notifyPlatform redis for PNS"

# Install redis.conf
#COPY redis.conf /usr/local/etc/redis/redis.conf

# If you are building your code for production
# RUN npm install --only=production

EXPOSE 6380

CMD [ "redis-server", "--port", "6380"]
#CMD [ "redis-server", "/usr/local/etc/redis/redis.conf" ]