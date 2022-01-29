# CRSearcher Impact Tool (Component Relationship Searcher: The Impact Tool)

##  Component Relationship Searcher : It is an Impact Tool 
  - This code searchs components relations with other components in all Architecture: It allows analyzing the impact at the level of all application components of the architecture in .
  - git repository: https://github.com/oamat/nodejs/tree/master/ComponentSearcher

## Software Requeriments
- Install Node & npm : https://nodejs.org/en/
- Redis on Docker (if you prefer redis on Docker):
    - Install Docker : https://docs.docker.com/engine/install/      
    - Redis DockerHub : https://hub.docker.com/_/redis/ (https://redis.io/download) 
- Redis for Windows (faster installation) :
    -   https://github.com/microsoftarchive/redis/releases
    -   https://github.com/dmajkic/redis/downloads

## Install
- npm install     (use package.json)
   - or you can install all packages: 

```bash
                # npm install prompts
                # npm install redis
                # npm install fast-csv
                # npm install --save-dev mocha
                # npm install --save-dev chai
                # npm install --global rdcli (optional for redis tests)
```
- copy ./redis-dump/dump.rdb in Redis root folder
   - Windows : you just have to copy dump.rdb in 'redis-root_folder\64bit', here you can find 'redis-server.exe'
```bash
            # ./redis-server.exe --service-start 
            # ./redis-server.exe --service-stop            
```
   - Docker: you can copy dump.rdb for example in /home/user/dev/rendiment/data and run docker like that :
           
```bash
            # docker run -p 127.0.0.1:6379:6379 -v /home/user/dev/rendiment/data:/data --name crsearcher-redis -d redis --save 60 1            
```
## Manual
- There are 2 programs :
    - **node .\app.js**        -> Simple CLI (Command Line Interface) with prompt that guides you to search for single component relationships (it would be possible in future to export it to a web site in cloud)
    - **node .\appBatch.js**   -> Complete Batch with special config into file, needs to be well configured but it's more powerfull and allow you to search multiple components relationships (it would not be to export to a cloud or web site)
- TEST & LOAD
    - **npm test**   -> For testing all search types                  
    - **node .\load.js**   -> For loading all CSV's files in memory (it's unnecessary because you can use './redis-dump/dump.rdb' directly)

```bash
      CLI: 
            # node app.js
      BATCH: 
            # node appBatch.js 
      TEST: 
            # npm test       
      LOAD ALL CSV-FILES IN MEMORY:
            # node load.js 
```

## LET'S START (A little TEST)
 
 - Start Redis Server (with dump.rdb in root folder, see Install section)
      

 - For CLI - app.js you only have to execute app.js and follow instructions. 

 - For BATCH - appBatch.js check './results/inputs/...' and use this templates before your first execution. 
1.  Edit ./init.json and type the correct path of your config.json.  (See init.json param definition bellow)
2.  Edit your config.json and write your configs (inputWithCSV,levelSearch, order,... ).   (See config.json param definition bellow)
3.  Execute # node ./appBatch.js
4.  As a test: first time you can compare ./results/*OutputFile.csv with the  './results/inputs/*/*Output.csv' (there are example configs there). It should be the same file. 
5.  Play with config params... 

## BATCH INIT.JSON PARAMS (./init.json)
There are 2 JSON file init.json with basic config always you can find in path './init.json'. Om the other hand you need a config.json, it can be whereever you want. 
```bash
{
    "RedisIP": "127.0.0.1", // Redis IP (127.0.0.1 by default). 
    "RedisPort": "6379",    // Redis port ( 6379 by default). 

    "JSONConfigFile": true,  // true if you want to load a config.json file of the next path param JSONConfigFilePath (only for batch version). 
    "JSONConfigFilePath": "./results/inputs/SNs/config.json"   // path of config.json with all configs for appBatch.js.
}
```
## BATCH CONFIG.JSON PARAMS (config.json)

 - You have to write your config.json file (there are some examples in './results/inputs/...')
      - Not recomended : As a developer you can modify first lines of the appBatch.js; these parameters that will determine the search for relationships (*CLI Config is implicit in prompt) !!Not recomended!!

## Annexed DEVELOPER TODO
- Discord integration: not for now
- appBatch.js is prepared for export config in a file or input params. Batch config via File or external .js


## Annexed START REDIS
**1.Start Redis in Docker**
```bash
     # docker run -p 127.0.0.1:6379:6379 -v /home/user/dev/rendiment/data:/data --name crsearcher-redis -d redis --save 60 1  (After copy rdb in folder)
     # docker run -d --name redis -p 6379:6379 redis      (if you prefer load all info)
     # docker ps -a 
     # docker stop redis
     # docker start redis
     # docker rm -fv redis (delete all Redis repositories)
     # rdcli -h [IP]:[PORT]    (SAVE & testing Redis)
        # rdcli -h 127.0.0.1:6379         (SAVE & testing Redis)

```
  
## Annexed LOAD COMPONENTS INTO REDIS (*unnecessary if you have dump.rb!!)
**2.Load 1 or all CSV files with relationships, with or without method searchs, average time and cost :**
```bash
      LOAD ALL FILES:
      # node load.js 
      
```