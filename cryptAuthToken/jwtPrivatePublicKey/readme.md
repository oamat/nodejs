# JWT with Public & Private Key

### Generate Keys:
We will create a dummy payload, but for Secret we need to create aprivate-public key pair. There are many ways of creating keys, the quickest one would be to use an online RSA key generator. There are many options available online, I prefer either one of those
1. csfieldguide
2. travistidwell

Note the “key size” — 512 bit, there are other options too like 1024 bit, 2048 bit, 4096 bit. No doubt longer key lengths are better, but you should know that — with every doubling of the RSA key length, decryption gets at least 6 times slower. Also, it’s not quite easy to make a brute force search on a 256-bit key (but possible).

### Execute code:
```bash

    # npm install
    # node jwt.js
 
```
