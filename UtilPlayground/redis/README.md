# Redis on nodeJS
Remember starting redis docker container :
  # docker run -d --name redis -p 6379:6379 redis

you can test with redis-cli: 
   # rdcli -h 192.168.99.100  (the docker IP)
       # ping
       # incr foo

execute node tst:
    # node redis.js

