FROM mongo

LABEL maintainer="oriol.amat@gmail.com"
LABEL version="1.0"
LABEL description="notifyPlatform mongodb"

ENV MONGO_INITDB_ROOT_USERNAME root
ENV MONGO_INITDB_ROOT_PASSWORD example
ENV MONGO_INITDB_DATABASE test

EXPOSE 30090

CMD [ "mongod", "--port", "30090"]