# CRSearcher Impact Tool (Component Relationship Searcher: The Impact Tool)

##  Component Relationship Searcher : It is an Impact Tool 
  - This code searchs components relations with other components in all Architecture: It allows analyzing the impact at the level of all application components of the architecture in CaixaBank.
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
   - I recomend to install packages before connected to VPN CaixaBabk or you can use proxy inisde VPN :
        - npm config set https-proxy http://proxysscc.svb.lacaixa.es:8080
        - npm config set proxy http://proxysscc.svb.lacaixa.es:8080
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
   
    palancas: true, => SPECIFIC CXB : is the file specific of CaixaBank Palancas Mitigación?
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

## Annexed DEMO 
CLI
- Normal: CA.OFI.MenusTerminal-> :  BE.CEFLEX
- Métodes: XMLAPP.whatsapp.altaWhatsapp (5 , 8) -> : <- BE.MUROGE (7) (amd i sense) SE.MCA.ExpedienteRiesgoInsDocumento.obNombreDoc
- Específic: SE.MCA.ExpedienteRiesgoInsDocumento,  SI.MCA.MuroConMiGestorGestion -> : <- DB.BKO   
Batch
- Format :  Palancas (IDEINS)
- Explicar conf (IDEINS)
- Demo configs


## Annexed EXAMPLES OF RELATIONS (TOURS)

-  TOUR1: CA.OFI.MenusTerminal =>  SN.MCA.GestFavoritosBE => BE.FAVORI => DB.BKGE01P  
-  TOUR2: CA.OFI.ObraSocialDescenGestionAccionSoc => SI.MCA.BuscadorPersonaBusquedaCliente => BE.CEFLEX  => DB.BKORA07P 
-  TOUR3: CA.OFI.Home  => SI.MCA.CallmeLlamadas => SI.MCA.CallmeLlamadas => SN.MCA.NotificaLlamada => BE.CALLME DB.BKORA07P
-  TOUR4: PNPE.CCT33 => PNPE.CDE14 => PNPE.MPR10 => BE.NOTIFY  
-  TOUR5: SI.MCA.ALFPromoCaixa => SI.MCA.AlfabeticPersonaMultiCanal => SN.MCA.AlfabeticPersonaMoSenyLOPD => ADS.ALF000ML => TX.ALFT9ML
-  TOUR6: With Methods:  XMLAPP.whatsapp.altaWhatsapp => PNPE.WHA5 => SI.MCA.MuroConMiGestorLlamadasExternas.altaServWhatsapp => ... BE.MUROGE-BC12
-  TOUR7: BE.CEFLEX, CA.OFI.Home.consSugerencias
-  TOUR8: SN.MCA.MarcaFirObl => Only SEs... SE.MCA.EliminaDocumento, SE.MCA.AltaDocDigital,... 
-  TOUR9: With Methods: XMLAPP.contratacionCuenta.listaTitularesCuenta => PNPE.CCT33 => SI.MCA.AlfabeticContrtoGestionContrato.consRelaciones => SN.MCA.AlfabeticContrtoLiRelContrato => ADS.ALF000CR => TX.ALFT9CC
-  TOUR9: SE.MCA.ExpedienteRiesgoInsDocumento.obNombreDoc => SI.MCA.ExpedienteRiesgoInsDocumento.insDocumento => SN.MCA.ExpAccesoODB.recuperaMimetypesODB
-  TOUR10: Search methods of: SE.MCA.ExpedienteRiesgoInsDocumento, SI.MCA.AlfabeticPersonaMultiCanal, SN.MCA.CCCognitivoNotif


## Annexed EXAMPLES OF REDIS RELATIONS (REDIS TEST)
- CA : smembers 'n_CA.OFI.AhorroPlazoContrato'  smembers 'na_CA.OFI.MiniFichaCliente' smembers 'r_BE.GDDPRQ'     
- XMLAPP-PNPE : smembers 'n_XMLAPP.whatsapp.altaWhatsapp'  smembers 'n_PNPE.WHA5'  smembers smembers 'n_PNPE.SET1'  smembers 'n_PNPE.MPR10' 'r_SI.MCA.MuroConMiGestorLlamadasExternas'
- SI-SN-ADS : smembers n_SI.MCA.ALFPromoCaixa smembers n_SI.MCA.AlfabeticPersonaMultiCanal smembers n_SN.MCA.AlfabeticPersonaMoSenyLOPD  smembers n_ADS.ALF000ML 
- BE-DB: smembers n_BE.ADMETF  r_BE.ASVENT  n_BE.CEFLEX
- BE-BC : get cn_BE.BCKGMI  /  smembers cr_BC11 
- DB-CLUSTER : get ncl_DB.BKORA07P  smembers rcl_ABSIS_CL02
- COMPLETE : smembers nm_XMLAPP.contratacionCuenta.listaTitularesCuenta => smembers nm_PNPE.CCT33 => smembers nm_SI.MCA.AlfabeticContrtoGestionContrato.consRelaciones => smembers nm_SN.MCA.AlfabeticContrtoLiRelContrato => smembers nm_ADS.ALF000CR => smembers - nm_TX.ALFT9CC


## DEVELOPER NOTES
   
      
- UnificacionInterface_METODOS.csv: Foto de los metodos de los SI y SN, IDS NO REPETIDOS. Se encuentra el primer SI que llamará a SI o SN en RELACIONES_METODOS
- UnificacionInterface_OPERACION.csv: Foto de las operaciones de las CA, IDS NO REPETIDOS. Se encuentra el primer CA que llamará a SI en RELACIONES_OP
- RELACIONES_METODOS.csv: Relaciones entre los metodos de SIs y SNs. En este fichero el campo ID es FK del fichero de METODOS, IDS ESTAN REPETIDOS: 1 SI llama a varios SI, SN
- RELACIONES_OPERACIONES.csv: Relaciones entre las operaciones de las CAs y los métodos de los SIs. En este fichero el campo ID es FK del fichero de OPERACIONES, IDS ESTAN REPETIDOS: 1 CA llama a varios SI, SN  
     
   HOW IT WORKS? 
      - Se cargan primero RELACIONES_NNN.csv (contiene id repetidos), en un array donde metemos un Set para no repetir componentes. 
      - Luego se cargan los UnificacionInterface_NNN y se va cogiendo cada id y revisando a que llama con el Set anterior (pueden ser varios)
      - Finalmente el load IDSBroken se cogen los SN.method sin relación : 
                  - Miramos si el SN sin mètodo llama a un BE o ADS y se añade.   (SN ADS HOST no tiene metodos).  
                  - Ejemplo: el SN.MCA.CCCognitivoNotif.consultarNotificacion no llamaba a nada
                                    Vimos que SN.MCA.CCCognitivoNotif lamaba a BE.CGNOFI y lo modificamos para que SN.MCA.CCCognitivoNotif.consultarNotificacion llame al BE. 
                                    Aunque también vimos que tenia otros métodos,  mejor curarnos en salut : 
                                                'SN.MCA.CCCognitivoNotif.eliminarNotificacion(594ms/594b)' 
                                                'SN.MCA.CCCognitivoNotif.consultarNotificacion(noHits/0)'
                                                'SN.MCA.CCCognitivoNotif.inLiNotificacion(568ms/2.2K)'
                                                'SN.MCA.CCCognitivoNotif.modificarNotificacion(581ms/2.9K)'
                                                'SN.MCA.CCCognitivoNotif.listarNotificaciones(636ms/17.1K)'
                                                'SN.MCA.CCCognitivoNotif.insertarNotificacion(noHits/0)'

- Camí recursiu, actualment s'atura només quan el component (e.g. un SI) està ja al component actual. En les cerques de tot no s'atura. 
- Si s'escull la relacions entre components (sense mètodes), Un SI o SN en pot tenir molts possibles. Així que podria ser que una crida no consumeixi tot. S'ha de veure en global.
- Els (noHits/0) son componentes que no s'han cridat en els últims 30 dies segons monitoring. 
- Els resultats de cerca amb mètode i sense mètode poden ser diferents. Normalment amb mètode dona més camins per component ja que cada component te N mètodes CA,SI i SN (x5) però per contre s'apunta millor i al final del camí normalment surten menys SN,BE i DB. No obstant això la cerca sense mètode pot trobar relacions que la cerca amb mètode no existeixen (exemple: SI.MCA.AsesorVentasManagersApi -> 'SN.MCA.AsesorVentasGesResVentas' -> 'BE.ASVENT') (SI.MCA.InternalInvocation -> SN.MCA.InvocacionSN -> BE.ARQRUN) la cerca amb mètode SN.MCA.AsesorVentasGesResVentas i  SN.MCA.InvocacionSN no es troben SI's. 
