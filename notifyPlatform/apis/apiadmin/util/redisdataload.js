//Dependencies

const { hmset, set, get, hset } = require('./redisconf');
const { logTime } = require('./formats');
const { findAllContractSms, findAllCollectorSms, findAllTelfSms, saveCollectorSms, saveContractSms } = require('../util/mongomultisms');
const { findAllContractPns, findAllCollectorPns, findAllTokenPns, saveCollectorPns, saveContractPns } = require('../util/mongomultipns');
const { CollectorSms, CollectorPns, ContractSms, ContractPns } = require('../config/mongoosemulti');
//{ findPNS, findAllPNS, findContractPns, findAllContractPns, saveContractPns, findCollectorPns, findAllCollectorPns, saveCollectorPns, updateCollectorPns, findTokenPns, findAllTokenPns, saveTokenPns, updateTokenPns }
//VARS


//Methods
const initRedisSMSConf = async () => {

    //select and save all SMS contracts
    let contracts = await findAllContractSms({ activated: true });
    if (!contracts || contracts.length == 0) {
        console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "SMS Contracts not found in MongoDB. Basic config has been saved in mongo & redis.");
        loadRedisForTesting();  // If we don't have contracts, probably mongo is empty, so we load redis with test info
    } else for (var i = 0; i < contracts.length; i++) {
        hmset(["contractsms:" + contracts[i].name,
            "jwt", contracts[i].jwt,
            "operator", contracts[i].operator,
            "interface", contracts[i].interface,
            "permission", contracts[i].permission,
            "type", contracts[i].type
        ]);
    }

    //select and save all SMS collectors
    let collectors = await findAllCollectorSms({ activated: true });
    if (!collectors || collectors.length == 0) { //we safe the default config
        console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "SMS Collectors not found in MongoDB. Basic config has been saved in mongo & redis.");
        saveAllSMSDefaultCollectors();
    }
    else for (var i = 0; i < collectors.length; i++) {
        hmset(["collectorsms:" + collectors[i].name,
            "status", (collectors[i].status ? 1 : 0),
            "interval", collectors[i].interval,
            "intervalControl", collectors[i].intervalControl,
            "operator", collectors[i].operator
        ]);
    }

    //select and save all SMS contracts ADMIN
    let contractsAdmin = await findAllContractSms({ name: "ADMIN" });
    if (!contractsAdmin || contractsAdmin.length == 0) { //we safe the default config
        console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "SMS Contracts Admin not found in MongoDB. Basic config has been saved in mongo & redis.");
        saveAdminSMSDefaultContract();
    } else for (var i = 0; i < contractsAdmin.length; i++) {
        hmset(["contractadmin:" + contractsAdmin[i].name,
            "jwt", contractsAdmin[i].jwt,
            "permission", contractsAdmin[i].permission,
            "type", contractsAdmin[i].type
        ]);
    }

    //select and save all SMS telfs (huge documents)
    let telfs = await findAllTelfSms({});
    if (!telfs || telfs.length == 0) console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "SMS telfs not found in MongoDB. Basic config has been saved in mongo & redis.");
    else for (var i = 0; i < telfs.length; i++) {
        hmset(["telfsms:" + telfs[i].telf,  //TODO: change key operator by .telf
            "operator", telfs[i].operator
        ]);
    }
}

const initRedisPNSConf = async () => {

    //select and save all PNS contracts
    let contracts = await findAllContractPns({ activated: true });
    if (!contracts || contracts.length == 0) {
        console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "PNS Contracts not found in MongoDB. Basic config has been saved in mongo & redis.");
        loadRedisForTesting();  // If we don't have contracts, probably mongo is empty, so we load redis with test info
    } else for (var i = 0; i < contracts.length; i++) {
        hmset(["contractpns:" + contracts[i].name,
            "jwt", contracts[i].jwt,
            "operator", contracts[i].operator,
            "interface", contracts[i].interface,
            "permission", contracts[i].permission,
            "type", contracts[i].type
        ]);
    }

    //select and save all PNS collectors
    let collectors = await findAllCollectorPns({ activated: true });
    if (!collectors || collectors.length == 0) { //we safe the default config
        console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "PNS Collectors not found in MongoDB. Basic config has been saved in mongo & redis.");
        saveAllPNSDefaultCollectors();
    }
    else for (var i = 0; i < collectors.length; i++) {
        hmset(["collectorpns:" + collectors[i].name,
            "status", (collectors[i].status ? 1 : 0),
            "interval", collectors[i].interval,
            "intervalControl", collectors[i].intervalControl,
            "operator", collectors[i].operator
        ]);
    }

    //select and save all SMS contracts ADMIN
    let contractsAdmin = await findAllContractPns({ name: "ADMIN" });
    if (!contractsAdmin || contractsAdmin.length == 0) {  //we safe the default config
        console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "PNS Contracts Admin not found in MongoDB. Basic config has been saved in mongo & redis.");
        saveAdminPNSDefaultContract();
    } else for (var i = 0; i < contractsAdmin.length; i++) {
        hmset(["contractadmin:" + contractsAdmin[i].name,
            "jwt", contractsAdmin[i].jwt,
            "permission", contractsAdmin[i].permission,
            "type", contractsAdmin[i].type
        ]);
    }

    //select and save all PSN tokens (huge documents)
    let tokens = await findAllTokenPns({});
    if (!tokens || tokens.length == 0) console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "PNS Tokens not found in MongoDB. Basic config has been saved in mongo & redis.");
    else for (var i = 0; i < tokens.length; i++) {
        hmset(["tokenpns:" + tokens[i].application + tokens[i].uuiddevice,
            "token", tokens[i].token,   //TODO: change key token by application+":"+uuiddevice
            "operator", tokens[i].operator
        ]);
    }
}



const loadRedisForTesting = async () => {
    //APIADMIN
    hset("contractadmin:ADMIN", "jwt", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFETUlOIiwiY29udHJhY3QiOiJBRE1JTiIsImlhdCI6MjAxNjIzOTAyMn0.vwBNTaBbW40v14Iiqd65uhv4FVQi4qn4ZH50VyQ00rg");
    //APIPNS Contracts
    hmset(["contractpns:PUSHLOWEB", "jwt", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlBVU0hMT1dFQiIsImNvbnRyYWN0IjoiUFVTSExPV0VCIiwiaWF0IjoyMDE2MjM5MDIyfQ.liOxBh3kFQyjYrIyhg2Uu3COoV83ruUsyLniWEJ8Apw", "operator", "ALL"]);
    //APISMS Contracts
    hmset(["contractsms:OTPLOWEB", "jwt", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6Ik9UUExPV0VCIiwiY29udHJhY3QiOiJPVFBMT1dFQiIsImlhdCI6MjAxNjIzOTAyMn0.BK58iwYbyfGb1u--SLP3YZP7JZxKSMrPHmdc-gfH4t4", "operator", "ALL"]);
    //batchSMS
    hmset(["collectorsms:batchSMS", "status", "1", "interval", "180000", "intervalControl", "60000"]);
    //batchPNSs
    hmset(["collectorpns:batchPNS", "status", "1", "interval", "180000", "intervalControl", "60000"]);
    //retriesSMS
    hmset(["collectorsms:retriesSMS", "status", "1", "interval", "1000", "intervalControl", "60000"]);
    //retriesPNSs
    hmset(["collectorpns:retriesPNS", "status", "1", "interval", "1000", "intervalControl", "60000"]);
    //Collectors Apple
    hmset(["collectorpns:APP", "status", "1", "interval", "2000", "intervalControl", "60000", "operator", "APP"]);
    //Collectors Android
    hmset(["collectorpns:GOO", "status", "1", "interval", "2000", "intervalControl", "60000", "operator", "GOO"]);
    //Collectors Microsoft
    hmset(["collectorpns:MIC", "status", "1", "interval", "2000", "intervalControl", "60000", "operator", "MIC"]);
    //Collectors Movistar
    hmset(["collectorsms:MOV", "status", "1", "interval", "2000", "intervalControl", "60000", "operator", "MOV"]);
    //Collectors MovistarVIP
    hmset(["collectorsms:VIP", "status", "1", "interval", "2000", "intervalControl", "60000", "operator", "VIP"]);
    //Collectors ORANGE
    hmset(["collectorsms:ORA", "status", "1", "interval", "2000", "intervalControl", "60000", "operator", "ORA"]);
    //Collectors VODAFONE
    hmset(["collectorsms:VOD", "status", "1", "interval", "2000", "intervalControl", "60000", "operator", "VOD"]);
    //PNS token
    hmset(["tokenpnsCaixaAPP:kRt346992-72809WA", "token", "AADDERTTTECCDDDkk34699272809WWwwsdfdeeffffAADDERTTTECCDDDkk34699272809WWwwsdfdeeffffAADDERTTTECCDDDkk34699272809WWwwsdfdeeffff", "operator", "GOO"]);
    //SMS telf
    hmset(["telfsms:0034699272800", "operator", "VOD"]);
}

const saveAllSMSDefaultCollectors = async () => {
    let CollectorModel = CollectorSms();  // we catch the ContractSMS Model            
    saveCollectorSms(new CollectorModel({ "operator": "MOV", "activated": true, "status": true, "name": "MOV", "description": "Collector SMS Movistar", "interval": 10, "intervalControl": 60000, "type": "SMS" }));
    saveCollectorSms(new CollectorModel({ "operator": "VIP", "activated": true, "status": true, "name": "VIP", "description": "Collector SMS Movistar - VIP", "interval": 10, "intervalControl": 60000, "type": "SMS" }));
    saveCollectorSms(new CollectorModel({ "operator": "VOD", "activated": true, "status": true, "name": "VOD", "description": "Collector SMS Vodafone", "interval": 10, "intervalControl": 60000, "type": "SMS" }));
    saveCollectorSms(new CollectorModel({ "operator": "ORA", "activated": true, "status": true, "name": "ORA", "description": "Collector SMS Orange", "interval": 10, "intervalControl": 60000, "type": "SMS" }));
    saveCollectorSms(new CollectorModel({ "operator": "batchSMS", "activated": true, "status": true, "name": "batchSMS", "description": "batch SMS", "interval": 180000, "intervalControl": 60000, "type": "SMS" }));
    saveCollectorSms(new CollectorModel({ "operator": "retriesSMS", "activated": true, "status": true, "name": "retriesSMS", "description": "retries SMS", "interval": 1000, "intervalControl": 60000, "type": "SMS" }));
    hmset(["collectorsms:batchSMS", "status", "1", "interval", "180000", "intervalControl", "60000"]);
    hmset(["collectorsms:retriesSMS", "status", "1", "interval", "1000", "intervalControl", "60000"]);
    hmset(["collectorsms:MOV", "status", "1", "interval", "10", "intervalControl", "60000", "operator", "MOV"]);
    hmset(["collectorsms:VIP", "status", "1", "interval", "10", "intervalControl", "60000", "operator", "VIP"]);
    hmset(["collectorsms:ORA", "status", "1", "interval", "10", "intervalControl", "60000", "operator", "ORA"]);
    hmset(["collectorsms:VOD", "status", "1", "interval", "10", "intervalControl", "60000", "operator", "VOD"]);
}

const saveAllPNSDefaultCollectors = async () => {
    let CollectorModel = CollectorPns();  // we catch the ContractSMS Model   
    saveCollectorPns(new CollectorModel({ "operator": "APP", "activated": true, "status": true, "name": "APP", "description": "Collector PNS Apple", "interval": 10, "intervalControl": 60000, "type": "PNS" }));
    saveCollectorPns(new CollectorModel({ "operator": "GOO", "activated": true, "status": true, "name": "GOO", "description": "Collector PNS Google", "interval": 10, "intervalControl": 60000, "type": "PNS" }));
    saveCollectorPns(new CollectorModel({ "operator": "MIC", "activated": true, "status": true, "name": "MIC", "description": "Collector PNS Microsoft", "interval": 10, "intervalControl": 60000, "type": "PNS" }));
    saveCollectorPns(new CollectorModel({ "operator": "batchPNS", "activated": true, "status": true, "name": "batchPNS", "description": "batch PNS", "interval": 180000, "intervalControl": 60000, "type": "PNS" }));
    saveCollectorSms(new CollectorModel({ "operator": "retriesPNS", "activated": true, "status": true, "name": "retriesPNS", "description": "retries PNS", "interval": 10000, "intervalControl": 60000, "type": "PNS" }));
    hmset(["collectorpns:retriesPNS", "status", "1", "interval", "180000", "intervalControl", "60000"]);
    hmset(["collectorpns:batchPNS", "status", "1", "interval", "1000", "intervalControl", "60000"]);
    hmset(["collectorpns:APP", "status", "1", "interval", "10", "intervalControl", "60000", "operator", "APP"]);
    hmset(["collectorpns:GOO", "status", "1", "interval", "10", "intervalControl", "60000", "operator", "GOO"]);
    hmset(["collectorpns:MIC", "status", "1", "interval", "10", "intervalControl", "60000", "operator", "MIC"]);
}

const saveAdminSMSDefaultContract = async () => {
    let ContractModel = ContractSms();  // we catch the ContractSMS Model            
    saveContractSms(new ContractModel({ "operator": "ALL", "defaultOperator": "ALL", "activated": true, "name": "ADMIN", "description": "ADMIN", "permission": "ALL", "application": "ADMIN", "interface": "ALL", "params": [], "type": "SMS", "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFETUlOIiwiY29udHJhY3QiOiJBRE1JTiIsImlhdCI6MjAxNjIzOTAyMn0.vwBNTaBbW40v14Iiqd65uhv4FVQi4qn4ZH50VyQ0rg" }));
    hset("contractadmin:ADMIN", "jwt", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFETUlOIiwiY29udHJhY3QiOiJBRE1JTiIsImlhdCI6MjAxNjIzOTAyMn0.vwBNTaBbW40v14Iiqd65uhv4FVQi4qn4ZH50VyQ00rg");

}

const saveAdminPNSDefaultContract = async () => {
    let ContractModel = ContractPns();  // we catch the ContractSMS Model   
    saveContractPns(new ContractModel({ "operator": "ALL", "defaultOperator": "ALL", "activated": true, "name": "ADMIN", "description": "ADMIN", "permission": "ALL", "application": "ADMIN", "interface": "ALL", "params": [], "type": "PNS", "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFETUlOIiwiY29udHJhY3QiOiJBRE1JTiIsImlhdCI6MjAxNjIzOTAyMn0.vwBNTaBbW40v14Iiqd65uhv4FVQi4qn4ZH50VyQ0rg" }));
    hset("contractadmin:ADMIN", "jwt", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFETUlOIiwiY29udHJhY3QiOiJBRE1JTiIsImlhdCI6MjAxNjIzOTAyMn0.vwBNTaBbW40v14Iiqd65uhv4FVQi4qn4ZH50VyQ00rg");

}

const loadRedisConfDependsOnDate = async () => {
    let last = parseInt(await get("lastLoadRedisConf"));
    let now = Date.now();

    if (!last) {
        initRedisPNSConf();
        initRedisSMSConf();
        set("lastLoadRedisConf", now);
        console.log(process.env.GREEN_COLOR, logTime(new Date()) + "Loading all Data in RedisConf...");
    } else {
        if ((last + 3600000) < now) {  // 1hour
            initRedisPNSConf();
            initRedisSMSConf();
            set("lastLoadRedisConf", now);
            console.log(process.env.GREEN_COLOR, logTime(new Date()) + "Loading all Data in RedisConf...");
        } else {
            console.log(process.env.GREEN_COLOR, logTime(new Date()) + "Loaded all Data in RedisConf before an hour.");
        }
    }
}

const loadRedisConf = async () => {
    initRedisSMSConf();
    initRedisPNSConf();    
}

module.exports = { loadRedisConf, loadRedisConfDependsOnDate }