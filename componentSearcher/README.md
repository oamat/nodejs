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

PARAM DEFINITION :
```bash
var config = {
    //1.INPUT 
    inputWithCSV: true, => we get file inputs from /results/input/[filename].csv? 
    fileInputCSV: 'BEs.csv', => file input name, Only in case inputWithCSV = true; e.g. 'palancas.csv', 'TLE.TX.csv'
    arrayInputs: [{ component: 'BE.ARQRUN', description: 'Demos ARQ' },{ component: 'BE.CEFLEX', description: 'Buscador Felxible' }],  => if 'inputWithCSV: false' you have to define this array with JSON array [ { component: 'x', description: 'y' }, ... ]  
   
    palancas: true, => SPECIFIC CXB : is the file specific of  Palancas Mitigación?
    addTypeToComponent: '', => SPECIFIC CXB : If you need to define the component type because input file don't have the component type. e.g: 'TX.', 'ADS.', 'SN.'. it can be empty '' if doesn't need.
    

    //2.SEARCH TYPE
    levelSearch: 6, => level search, e.g. if you want the first SI from BE you only need 3 levels (BE->SN->SI), it is unnecessary to search more. 
    order: false, => it is the order of search : true = normal (XMLAPP->PNPE/CA/SE->SI->SN->BE/ADS->DB), false = reverse (DB->BE/ADS->SN->SI->PNPE/CA/SE->XMLAPP).
    skipSI: false, => if you want to Skip the SI layer, sometimes it can be wide.
    componentTypeToSearch: 0,  => Filter type, see choices constant for more info -> See const choices -> e.g '0 is all components'
    searchMethod: 1, => Component with operation? 0 with Method, 1 WithoutMethod, 2 Only Method reference
    withCostOfComponent: true,  => Do you want the cost of component? hits and hits*averageTime

    //3.OUTPUT  
    outputAllInOneCSV: true, => true : all in 1 file, false: Every component to search in a different CSV
    outputCSVName: 'BEs.csv',  => Only in case outputAllInOneCSV = true, if not we create a file per component with component name

    //4.ABSIS ARQ IDEINS DEACTIVATION, only if you want deactivate ABSIS Operations
    outputIDEINSFile: true, => Specific of ABSIS: if you want generate a IDEINS file for deactivation components
    deactivationTypeComponent: 'SI1', => Specific of ABSIS: if you want generate a IDEINS file for deactivation components, CA, SI or SN requires CA1, SI1 or SN1
    outputCSVNameIDEINS: 'IDEINS.BEs.carrega-massiva-operatives-absis.csv' => Specific of ABSIS: define the name of outputFile    
    outputComponentWithOperation: false => Specific of ABSIS: deactivate operation component IDEINS, Only for CAs, SIs and SNs if searchMethod is 0 (with method).
};
     
```

## componentTypeToSearch choices

```bash
const choices = [
    { title: 'ALL Components', value: 'ALL' },  => componentTypeToSearch = 0
    { title: 'CA (first)', value: 'CA' },  => componentTypeToSearch = 1
    { title: 'XMLAPP', value: 'XM' },  => componentTypeToSearch = 2
    { title: 'PNPE', value: 'PN' },  => componentTypeToSearch = 3
    { title: 'SE', value: 'SE' },  => componentTypeToSearch = 4
    { title: 'SI (first)', value: 'SI' },  => componentTypeToSearch = 5
    { title: 'SN (first)', value: 'SN' },  => componentTypeToSearch = 6
    { title: 'BE', value: 'BE' },  => componentTypeToSearch = 7
    { title: 'ADS', value: 'AD' },  => componentTypeToSearch = 8
    { title: 'TX', value: 'TX' },  => componentTypeToSearch = 9
    { title: 'SA', value: 'SA' },  => componentTypeToSearch = 10
    { title: 'DB', value: 'DB' },  => componentTypeToSearch = 11
    { title: 'BE/DB', value: 'BE&DB' },  => componentTypeToSearch = 12
    { title: 'BE/BC', value: 'BE&BC' },  => componentTypeToSearch = 13
    { title: 'BE/DB/BC', value: 'BE&DB&BC' },  => componentTypeToSearch = 14
    { title: 'ADS/TX', value: 'ADS&TX' },  => componentTypeToSearch = 15
    { title: 'ADS/TX/SA', value: 'ADS&TX&SA' },  => componentTypeToSearch = 16
    { title: 'BE/DB & ADS/TX', value: 'BEDB&ADSTX' },  => componentTypeToSearch = 17
    { title: 'BE/DB & TX/ADS/SA', value: 'BE&ADSALL' },  => componentTypeToSearch = 18
    { title: 'TA', value: 'TA' },  => componentTypeToSearch = 19
];
```

## COMPONENT SCHEMA & FORMAT

- POSIBLE RELATION SCHEMA:
```bash
    -  # XMLAPP <-> PNPE/CA.../SE <-> SI... <-> SN... <-> ADS <-> TX <-> PSB <-> SA <-> TA <-> SYS
    -  # XMLAPP <-> PNPE/CA.../SE <-> SI... <-> SN... <-> BE-BC <-> DB-CL      
    -  # XMLAPP <-> PNPE/CA.../SE <-> SI... <-> SN... <-> ADS <-> SA   
```

- FORMAT COMPONENTS:
 - XMLAPP.[mame].[method] : e.g : XMLAPP.whatsapp.altaWhatsapp (Always with method: with or without method search we need same INPUT ).
 - PNPE.[name] :  e.g :  PNPE.CCT33 (with or without method search we need same INPUT ).
 - CA.OFI.[name] or *CA.OFI.[name].[method] :  e.g : CA.OFI.Trazabilidad  or  *CA.OFI.Trazabilidad.consPeticiones (with or without method search the INPUT is different).
 - SE.MCA.[name] or SE.MCA.[name].[method] : We don't use [interface] (it's unnecessary) e.g. SE.MCA.ValoresTraspasos or SE.MCA.ValoresTraspasosGestion.gestionarSol (with or without method search the INPUT is different).
 - SI.MCA.[name] or *SI.MCA.[name].[method] :  e.g : SI.MCA.MuroConMiGestorOFI  or  *SI.MCA.MuroConMiGestorOFI.enviarMensajeMur (with or without method search the INPUT is different).
 - SN.MCA.[name] or *SN.MCA.[name].[method] :  e.g : SN.MCA.ConsDatosMuro  or  *SN.MCA.ConsDatosMuro.alertasMovilSN (with or without method search the INPUT is different).
 - BE.[name] :  e.g :  BE.MUROGE . Note that SCHEMA ussually is the same as [name] in Oracle DB, not in DB2. (with or without method search we need same INPUT ).
 - BC[number] : e.g :  BC11 (with or without method search we need same INPUT ). !!!!!ONLY SEARCH BEs and SNs!!!!!
 - DB.[name] :  e.g :  DB.BKMUR1P (with or without method search we need same INPUT )
 - CL.[name] : e.g :  CL.ABSIS_CL01 (with or without method search we need same INPUT ) !!!!!ONLY SEARCH DBs!!!!!
 - ADS.[name] : e.g :  ADS.ALF0000E (with or without method search we need same INPUT ).
 - TX.[name] :  e.g :  TX.ALFT8AC (with or without method search we need same INPUT ).
 - PSB.[name] : e.g :  PSB.ALFP8AC (with or without method search we need same INPUT ).
 - TA.[name] : e.g :  TA.CODT01 (with or without method search we need same INPUT ).
 - SYS.[name] (Auto Reverse): e.g :  SYS.EXP1  (with or without method search we need same INPUT ).
 - SA.[name] (Auto Reverse): e.g :  SA.ALF1247 (with or without method search we need same INPUT ).


# Annexed, not necessary to read 

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