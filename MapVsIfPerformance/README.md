# Map vs If Performance Test in NodeJS


Time ago I started to discuss with a co-worker about the performance diference betwen Map O(logN) vs If statement O(1) - O(N), And finally I wrote this source code.It was a surprise because that code demostrates a map.get is faster than one If when you call it a lot of times (10M) in nodejs.

And the output indicates that the map test obtain the best time:

    > Debugging with inspector protocol because Node.js v8.9.4 was detected.

    > node mapvsif.js 

    > Map time: 18.112ms

    > if time 1: 22.162ms
    
    > if time 2: 82.372ms
