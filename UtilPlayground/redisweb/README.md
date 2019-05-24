# Redis on nodeJS
Remember starting redis docker container :
  $ docker run -d --name redis -p 6379:6379 redis

# you can test with redis-cli: 
   $ rdcli -h 192.168.99.100  (the docker IP)
       # ping      

# Start node Server:
   $ node app.js 
      Browse http://localhost:3000
