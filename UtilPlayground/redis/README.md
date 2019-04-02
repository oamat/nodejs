# Redis on nodeJS
Remember starting redis docker container :
  # docker run -d --name redis -p 6379:6379 redis

you can test with redis-cli: 
   # rdcli -h 192.168.99.100  (the docker IP)
       # ping      

execute node PoC's:

# node redis-string.js 
      you can test with rdcli:   get mystring

# node redis-hash.js 
    you can test with rdcli:   hgetall hashkey

# node redis-list.js 
    you can test with rdcli:  LINDEX mylist 0

# node redis-set.js 
    you can test with rdcli:  SDIFF myset



# node redis-pubsub.js (pubsub test, all in 1 *.js)
In pubsub folder you can see 'complete' pub/sub application, there are 4 node aplications:  1 publicator / 3 subscribers
# node redis-sub1.js (sub channel 1)
# node redis-sub2.js (sub channel 2)
# node redis-sub3.js (sub channel 3)
# node redis-pub.js (pub in all channels 1,2,3..)

