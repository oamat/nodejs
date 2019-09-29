//Dependencies

const { hmset, set, get } = require('./redisconf');
const { logTime } = require('./formats');
const { findAllContractSms, findAllCollectorSms, findAllTelfSms, saveCollectorSms, saveContractSms, saveTelfSms } = require('../util/mongomultisms');
const { findAllContractPns, findAllCollectorPns, findAllTokenPns, saveCollectorPns, saveContractPns, saveTokenPns } = require('../util/mongomultipns');
const { CollectorSms, CollectorPns, ContractSms, ContractPns, TokenPns, TelfSms } = require('../config/mongoosemulti');
//{ findPNS, findAllPNS, findContractPns, findAllContractPns, saveContractPns, findCollectorPns, findAllCollectorPns, saveCollectorPns, updateCollectorPns, findTokenPns, findAllTokenPns, saveTokenPns, updateTokenPns }
//VARS


//Methods
const initRedisSMSConf = async () => {

    //select and save all SMS contracts
    let contracts = await findAllContractSms({ activated: true });
    if (!contracts || contracts.length == 0) {
        console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "SMS Contracts not found in MongoDB. Basic config has been saved in mongo & redis.");
        saveSMSDefaultContract(true);
    } else for (var i = 0; i < contracts.length; i++) {
        hmset(["contractsms:" + contracts[i].name,
            "jwt", contracts[i].jwt,
            "operator", contracts[i].operator,
            "defaultOperator", contracts[i].defaultOperator,
            "activated", contracts[i].activated,
            "interface", contracts[i].interface,
            "permission", contracts[i].permission,
            "application", contracts[i].application,
            "type", contracts[i].type,
            "frontend", (contracts[i].frontend ? contracts[i].frontend : "NO"),
            "remitter", (contracts[i].remitter ? contracts[i].remitter : "NO")
        ]);

        if (contracts[i].frontend) {
            hmset(["contractadmin:" + contracts[i].name,
                "jwt", contracts[i].jwt,
                "permission", contracts[i].permission,
                "activated", contracts[i].activated,
                "application", contracts[i].application,
                "type", contracts[i].type,
                "frontend", contracts[i].frontend
            ]);
        }
    }


    //select and save all SMS collectors
    let collectors = await findAllCollectorSms({ activated: true });
    if (!collectors || collectors.length == 0) { //we safe the default config
        console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "SMS Collectors not found in MongoDB. Basic config has been saved in mongo & redis.");
        saveAllSMSDefaultCollectors(true);
    }
    else for (var i = 0; i < collectors.length; i++) {
        hmset(["collectorsms:" + collectors[i].name,
            "status", (collectors[i].status ? 1 : 0),
            "interval", collectors[i].interval,
            "intervalControl", collectors[i].intervalControl,
            "operator", collectors[i].operator,
            "remitter", (collectors[i].remitter ? collectors[i].remitter : "NO")
        ]);
    }

    //select and save all SMS telfs (huge documents)
    let telfs = await findAllTelfSms({});
    if (!telfs || telfs.length == 0) {
        console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "SMS telfs not found in MongoDB. Basic config has been saved in mongo & redis.");
        saveSMSDefaultTelfSms(true);
    }
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
        savePNSDefaultContract(true);
    } else for (var i = 0; i < contracts.length; i++) {
        hmset(["contractpns:" + contracts[i].name,
            "jwt", contracts[i].jwt,
            "operator", contracts[i].operator,
            "defaultOperator", contracts[i].defaultOperator,
            "activated", contracts[i].activated,
            "interface", contracts[i].interface,
            "permission", contracts[i].permission,
            "application", contracts[i].application,
            "type", contracts[i].type,
            "frontend", (contracts[i].frontend ? contracts[i].frontend : "NO"),
            "remitter", (contracts[i].remitter ? contracts[i].remitter : "NO")
        ]);
        if (contracts[i].frontend) {
            hmset(["contractadmin:" + contracts[i].name,
                "jwt", contracts[i].jwt,
                "permission", contracts[i].permission,
                "activated", contracts[i].activated,
                "application", contracts[i].application,
                "type", contracts[i].type,
                "frontend", contracts[i].frontend
            ]);
        }
    }
    //select and save all PNS collectors
    let collectors = await findAllCollectorPns({ activated: true });
    if (!collectors || collectors.length == 0) { //we safe the default config
        console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "PNS Collectors not found in MongoDB. Basic config has been saved in mongo & redis.");
        saveAllPNSDefaultCollectors(true);
    }
    else for (var i = 0; i < collectors.length; i++) {
        hmset(["collectorpns:" + collectors[i].name,
            "status", (collectors[i].status ? 1 : 0),
            "interval", collectors[i].interval,
            "intervalControl", collectors[i].intervalControl,
            "operator", collectors[i].operator,
            "remitter", (collectors[i].remitter ? collectors[i].remitter : "NO")
        ]);
    }

    //select and save all PNS tokens (huge documents)
    let tokens = await findAllTokenPns({});
    if (!tokens || tokens.length == 0) {
        console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "PNS Tokens not found in MongoDB. Basic config has been saved in mongo & redis.");
        savePNSDefaultTokenPns(true);
    }
    else for (var i = 0; i < tokens.length; i++) {
        hmset(["tokenpns:" + tokens[i].application + tokens[i].uuiddevice,
            "token", tokens[i].token,   //TODO: change key token by application+":"+uuiddevice
            "operator", tokens[i].operator
        ]);
    }
}


const resetAllProcessedErrors = async () => {
    //PNS CollectorStatus
    hmset(["collectorpns:APP", "processed", 0, "errors", 0]);
    hmset(["collectorpns:GOO", "processed", 0, "errors", 0]);
    hmset(["collectorpns:MIC", "processed", 0, "errors", 0]);
    hmset(["collectorsms:MOV", "processed", 0, "errors", 0]);
    hmset(["collectorsms:VIP", "processed", 0, "errors", 0]);
    hmset(["collectorsms:VOD", "processed", 0, "errors", 0]);
    hmset(["collectorsms:ORA", "processed", 0, "errors", 0]);
    hmset(["collectorsms:batchSMS", "processed", 0, "errors", 0]);
    hmset(["collectorpns:batchPNS", "processed", 0, "errors", 0]);
    hmset(["collectorsms:retriesSMS", "processed", 0, "errors", 0]);
    hmset(["collectorpns:retriesPNS", "processed", 0, "errors", 0]);
    hmset(["apiadmin", "processed", 0, "errors", 0]);
    hmset(["apisms", "processed", 0, "errors", 0]);
    hmset(["apipns", "processed", 0, "errors", 0]);
    hmset(["apistatusback", "processed", 0, "errors", 0]);
    hmset(["mqsms", "processed", 0, "errors", 0]);
    hmset(["mqpns", "processed", 0, "errors", 0]);
}

const saveAllSMSDefaultCollectors = async (toBBDD) => {
    if (toBBDD) {
        let CollectorModel = CollectorSms();  // we catch the ContractSMS Model            
        saveCollectorSms(new CollectorModel({ "operator": "MOV", "activated": true, "status": true, "name": "MOV", "description": "Collector SMS Movistar", "interval": 1, "intervalControl": 30000, "type": "SMS", "remitter": "217771" }));
        saveCollectorSms(new CollectorModel({ "operator": "VIP", "activated": true, "status": true, "name": "VIP", "description": "Collector SMS Movistar - VIP", "interval": 1, "intervalControl": 30000, "type": "SMS", "remitter": "217771" }));
        saveCollectorSms(new CollectorModel({ "operator": "VOD", "activated": true, "status": true, "name": "VOD", "description": "Collector SMS Vodafone", "interval": 1, "intervalControl": 30000, "type": "SMS", "remitter": "217771" }));
        saveCollectorSms(new CollectorModel({ "operator": "ORA", "activated": true, "status": true, "name": "ORA", "description": "Collector SMS Orange", "interval": 1, "intervalControl": 30000, "type": "SMS", "remitter": "217771" }));
        saveCollectorSms(new CollectorModel({ "operator": "ALL", "activated": true, "status": true, "name": "batchSMS", "description": "batch SMS", "interval": 180000, "intervalControl": 30000, "type": "SMS", "remitter": "217771" }));
        saveCollectorSms(new CollectorModel({ "operator": "ALL", "activated": true, "status": true, "name": "retriesSMS", "description": "retries SMS", "interval": 1000, "intervalControl": 30000, "type": "SMS", "remitter": "217771" }));
    }
    hmset(["collectorsms:batchSMS", "status", 1, "interval", 180000, "intervalControl", 30000]);
    hmset(["collectorsms:retriesSMS", "status", 1, "interval", 1000, "intervalControl", 30000]);
    hmset(["collectorsms:MOV", "status", 1, "interval", 1, "intervalControl", 30000, "operator", "MOV", "remitter", "217771"]);
    hmset(["collectorsms:VIP", "status", 1, "interval", 1, "intervalControl", 30000, "operator", "VIP", "remitter", "217771"]);
    hmset(["collectorsms:ORA", "status", 1, "interval", 1, "intervalControl", 30000, "operator", "ORA", "remitter", "217771"]);
    hmset(["collectorsms:VOD", "status", 1, "interval", 1, "intervalControl", 30000, "operator", "VOD", "remitter", "217771"]);
}

const saveAllPNSDefaultCollectors = async (toBBDD) => {
    if (toBBDD) {
        let CollectorModel = CollectorPns();  // we catch the ContractSMS Model   
        saveCollectorPns(new CollectorModel({ "operator": "APP", "activated": true, "status": true, "name": "APP", "description": "Collector PNS Apple", "interval": 1, "intervalControl": 30000, "type": "PNS" }));
        saveCollectorPns(new CollectorModel({ "operator": "GOO", "activated": true, "status": true, "name": "GOO", "description": "Collector PNS Google", "interval": 1, "intervalControl": 30000, "type": "PNS" }));
        saveCollectorPns(new CollectorModel({ "operator": "MIC", "activated": true, "status": true, "name": "MIC", "description": "Collector PNS Microsoft", "interval": 1, "intervalControl": 30000, "type": "PNS" }));
        saveCollectorPns(new CollectorModel({ "operator": "ALL", "activated": true, "status": true, "name": "batchPNS", "description": "batch PNS", "interval": 180000, "intervalControl": 30000, "type": "PNS" }));
        saveCollectorSms(new CollectorModel({ "operator": "ALL", "activated": true, "status": true, "name": "retriesPNS", "description": "retries PNS", "interval": 1000, "intervalControl": 30000, "type": "PNS" }));
    }
    hmset(["collectorpns:batchPNS", "status", 1, "interval", 180000, "intervalControl", 30000]);
    hmset(["collectorpns:retriesPNS", "status", 1, "interval", 1000, "intervalControl", 30000]);
    hmset(["collectorpns:APP", "status", 1, "interval", 1, "intervalControl", 30000, "operator", "APP"]);
    hmset(["collectorpns:GOO", "status", 1, "interval", 1, "intervalControl", 30000, "operator", "GOO"]);
    hmset(["collectorpns:MIC", "status", 1, "interval", 1, "intervalControl", 30000, "operator", "MIC"]);
}


const saveSMSDefaultContract = async (toBBDD) => {
    if (toBBDD) {
        let ContractModel = ContractSms();  // we catch the ContractSMS Model            
        saveContractSms(new ContractModel({ "operator": "MOV", "defaultOperator": "MOV", "frontend": "THIS", "activated": true, "name": "OTPLOWEB", "description": "OTPLOWEB", "permission": "WITHIN_APP", "application": "OTPLOWEB_APP", "interface": "ALL", "remitter": "217771", "params": [], "type": "SMS", "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6Ik9UUExPV0VCIiwiY29udHJhY3QiOiJPVFBMT1dFQiIsImlhdCI6MjAxNjIzOTAyMn0.BK58iwYbyfGb1u--SLP3YZP7JZxKSMrPHmdc-gfH4t4" }));
        saveContractSms(new ContractModel({ "operator": "VOD", "defaultOperator": "VOD", "frontend": "THIS", "activated": true, "name": "OTPLOWEBVOD", "description": "OTPLOWEB", "permission": "WITHIN_APP", "application": "OTPLOWEB_APP", "interface": "ALL", "remitter": "217771", "params": [], "type": "SMS", "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6Ik9UUExPV0VCVk9EIiwiY29udHJhY3QiOiJPVFBMT1dFQlZPRCIsImlhdCI6MjAxNjIzOTAyMn0.DZlLbO-xak3lneZ_93yZQszEd0gKXb0MVhwS27Unbtg" }));
        saveContractSms(new ContractModel({ "operator": "MOV", "defaultOperator": "ALL", "frontend": "ALL", "activated": true, "name": "ADMIN", "description": "ADMIN", "permission": "ALL", "application": "ADMIN", "interface": "ALL", "remitter": "217771", "params": [], "type": "SMS", "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFETUlOIiwiY29udHJhY3QiOiJBRE1JTiIsImlhdCI6MjAxNjIzOTAyMn0.vwBNTaBbW40v14Iiqd65uhv4FVQi4qn4ZH50VyQ00rg" }));
    }
    hmset(["contractsms:OTPLOWEB", "activated", true, "interface", "ALL", "permission", "WITHIN_APP", "frontend", "THIS", "operator", "MOV", "defaultOperator", "MOV", "remitter", "217771", "jwt", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6Ik9UUExPV0VCIiwiY29udHJhY3QiOiJPVFBMT1dFQiIsImlhdCI6MjAxNjIzOTAyMn0.BK58iwYbyfGb1u--SLP3YZP7JZxKSMrPHmdc-gfH4t4"]);
    hmset(["contractsms:OTPLOWEBVOD", "activated", true, "interface", "ALL", "permission", "WITHIN_APP", "frontend", "THIS", "operator", "VOD", "defaultOperator", "VOD", "remitter", "217771", "jwt", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6Ik9UUExPV0VCVk9EIiwiY29udHJhY3QiOiJPVFBMT1dFQlZPRCIsImlhdCI6MjAxNjIzOTAyMn0.DZlLbO-xak3lneZ_93yZQszEd0gKXb0MVhwS27Unbtg"]);
    hmset(["contractsms:ADMIN", "activated", true, "interface", "ALL", "permission", "ALL", "frontend", "ALL", "operator", "MOV", "defaultOperator", "MOV", "remitter", "217771", "jwt", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFETUlOIiwiY29udHJhY3QiOiJBRE1JTiIsImlhdCI6MjAxNjIzOTAyMn0.vwBNTaBbW40v14Iiqd65uhv4FVQi4qn4ZH50VyQ00rg"]);
    hmset(["contractadmin:OTPLOWEBVOD", "activated", true, "interface", "ALL", "permission", "WITHIN_APP", "frontend", "THIS", "operator", "VOD", "defaultOperator", "VOD", "remitter", "217771", "jwt", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6Ik9UUExPV0VCVk9EIiwiY29udHJhY3QiOiJPVFBMT1dFQlZPRCIsImlhdCI6MjAxNjIzOTAyMn0.DZlLbO-xak3lneZ_93yZQszEd0gKXb0MVhwS27Unbtg"]);
    hmset(["contractadmin:OTPLOWEB", "activated", true, "interface", "ALL", "permission", "WITHIN_APP", "frontend", "THIS", "operator", "MOV", "defaultOperator", "MOV", "remitter", "217771", "jwt", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6Ik9UUExPV0VCIiwiY29udHJhY3QiOiJPVFBMT1dFQiIsImlhdCI6MjAxNjIzOTAyMn0.BK58iwYbyfGb1u--SLP3YZP7JZxKSMrPHmdc-gfH4t4"]);
    hmset(["contractadmin:ADMIN", "activated", true, "interface", "ALL", "permission", "ALL", "frontend", "ALL", "operator", "MOV", "defaultOperator", "MOV", "remitter", "217771", "jwt", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFETUlOIiwiY29udHJhY3QiOiJBRE1JTiIsImlhdCI6MjAxNjIzOTAyMn0.vwBNTaBbW40v14Iiqd65uhv4FVQi4qn4ZH50VyQ00rg"]);
}

const savePNSDefaultContract = async (toBBDD) => {
    if (toBBDD) {
        let ContractModel = ContractPns();  // we catch the ContractSMS Model            
        saveContractPns(new ContractModel({ "operator": "ALL", "defaultOperator": "ALL", "frontend": "THIS", "activated": true, "name": "PUSHLOWEB", "description": "PUSHLOWEB", "permission": "WITHIN_APP", "application": "PUSHLOWEB_APP", "interface": "ALL", "params": [], "type": "PNS", "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlBVU0hMT1dFQiIsImNvbnRyYWN0IjoiUFVTSExPV0VCIiwiaWF0IjoyMDE2MjM5MDIyfQ.liOxBh3kFQyjYrIyhg2Uu3COoV83ruUsyLniWEJ8Apw" }));
        saveContractPns(new ContractModel({ "operator": "ALL", "defaultOperator": "ALL", "frontend": "ALL", "activated": true, "name": "ADMIN", "description": "ADMIN", "permission": "ALL", "application": "ADMIN", "interface": "ALL", "params": [], "type": "PNS", "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFETUlOIiwiY29udHJhY3QiOiJBRE1JTiIsImlhdCI6MjAxNjIzOTAyMn0.vwBNTaBbW40v14Iiqd65uhv4FVQi4qn4ZH50VyQ00rg" }));
    }
    hmset(["contractpns:PUSHLOWEB", "activated", true, "interface", "ALL", "permission", "WITHIN_APP", "frontend", "THIS", "operator", "ALL", "defaultOperator", "ALL", "jwt", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlBVU0hMT1dFQiIsImNvbnRyYWN0IjoiUFVTSExPV0VCIiwiaWF0IjoyMDE2MjM5MDIyfQ.liOxBh3kFQyjYrIyhg2Uu3COoV83ruUsyLniWEJ8Apw"]);
    hmset(["contractpns:ADMIN", "activated", true, "interface", "ALL", "permission", "ALL", "frontend", "ALL", "operator", "ALL", "defaultOperator", "ALL", "jwt", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFETUlOIiwiY29udHJhY3QiOiJBRE1JTiIsImlhdCI6MjAxNjIzOTAyMn0.vwBNTaBbW40v14Iiqd65uhv4FVQi4qn4ZH50VyQ00rg"]);
    hmset(["contractadmin:PUSHLOWEB", "activated", true, "interface", "ALL", "permission", "WITHIN_APP", "frontend", "THIS", "operator", "ALL", "defaultOperator", "ALL", "jwt", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlBVU0hMT1dFQiIsImNvbnRyYWN0IjoiUFVTSExPV0VCIiwiaWF0IjoyMDE2MjM5MDIyfQ.liOxBh3kFQyjYrIyhg2Uu3COoV83ruUsyLniWEJ8Apw"]);
    hmset(["contractadmin:ADMIN", "activated", true, "interface", "ALL", "permission", "ALL", "frontend", "ALL", "operator", "ALL", "defaultOperator", "ALL", "jwt", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFETUlOIiwiY29udHJhY3QiOiJBRE1JTiIsImlhdCI6MjAxNjIzOTAyMn0.vwBNTaBbW40v14Iiqd65uhv4FVQi4qn4ZH50VyQ00rg"]);

}

const saveSMSDefaultTelfSms = async (toBBDD) => {
    if (toBBDD) {
        let TelfModel = TelfSms();  // we catch the ContractSMS Model
        saveTelfSms(new TelfModel({ "telf": "0034699272800", "operator": "MOV" }));
        saveTelfSms(new TelfModel({ "telf": "0034699272801", "operator": "VIP" }));
        saveTelfSms(new TelfModel({ "telf": "0034699272802", "operator": "VOD" }));
        saveTelfSms(new TelfModel({ "telf": "0034699272803", "operator": "ORA" }));
        saveTelfSms(new TelfModel({ "telf": "0034699272804", "operator": "MOV" }));
        saveTelfSms(new TelfModel({ "telf": "0034699272805", "operator": "VIP" }));
    }
    hmset(["telfsms:0034699272800", "operator", "MOV"]);
    hmset(["telfsms:0034699272801", "operator", "VIP"]);
    hmset(["telfsms:0034699272802", "operator", "VOD"]);
    hmset(["telfsms:0034699272803", "operator", "ORA"]);
    hmset(["telfsms:0034699272804", "operator", "MOV"]);
    hmset(["telfsms:0034699272805", "operator", "VIP"]);
}

const savePNSDefaultTokenPns = async (toBBDD) => {
    if (toBBDD) {
        let TokenModel = TokenPns();  // we catch the ContractSMS Model
        saveTokenPns(new TokenModel({ "activated": true, "contract": "PUSHLOWEB", "application": "CaixaAPP", "user": "userTst", "uuiddevice": "kRt346992-72809WA", "token": "AADDERTTTECCDDDkk34699272809WWwwsdfdeeffffAADDERTTTECCDDDkk34699272809WWwwsdfdeeffffAADDERTTTECCDDDkk34699272809WWwwsdfdeeffff", "operator": "GOO" }));
        saveTokenPns(new TokenModel({ "activated": true, "contract": "PUSHLOWEB", "application": "CaixaAPP", "user": "userTst", "uuiddevice": "kRt346992-72809WB", "token": "AADDERTTTECCDDDkk34699272809WWwwsdfdeeffffAADDERTTTECCDDDkk34699272809WWwwsdfdeeffffAADDERTTTECCDDDkk34699272809WWwwsdfdeeffff", "operator": "APP" }));
        saveTokenPns(new TokenModel({ "activated": true, "contract": "PUSHLOWEB", "application": "CaixaAPP", "user": "userTst", "uuiddevice": "kRt346992-72809WC", "token": "AADDERTTTECCDDDkk34699272809WWwwsdfdeeffffAADDERTTTECCDDDkk34699272809WWwwsdfdeeffffAADDERTTTECCDDDkk34699272809WWwwsdfdeeffff", "operator": "MIC" }));
        saveTokenPns(new TokenModel({ "activated": true, "contract": "PUSHLOWEB", "application": "CaixaAPP", "user": "userTst", "uuiddevice": "kRt346992-72809WD", "token": "AADDERTTTECCDDDkk34699272809WWwwsdfdeeffffAADDERTTTECCDDDkk34699272809WWwwsdfdeeffffAADDERTTTECCDDDkk34699272809WWwwsdfdeeffff", "operator": "GOO" }));
        saveTokenPns(new TokenModel({ "activated": true, "contract": "PUSHLOWEB", "application": "CaixaAPP", "user": "userTst", "uuiddevice": "kRt346992-72809WE", "token": "AADDERTTTECCDDDkk34699272809WWwwsdfdeeffffAADDERTTTECCDDDkk34699272809WWwwsdfdeeffffAADDERTTTECCDDDkk34699272809WWwwsdfdeeffff", "operator": "GOO" }));
    }
    hmset(["tokenpnsCaixaAPP:kRt346992-72809WA", "application", "CaixaAPP", "contract", "PUSHLOWEB", "uuiddevice", "kRt346992-72809WA", "token", "AADDERTTTECCDDDkk34699272809WWwwsdfdeeffffAADDERTTTECCDDDkk34699272809WWwwsdfdeeffffAADDERTTTECCDDDkk34699272809WWwwsdfdeeffff", "user", "userTst", "operator", "GOO"]);
    hmset(["tokenpnsCaixaAPP:kRt346992-72809WB", "application", "CaixaAPP", "contract", "PUSHLOWEB", "uuiddevice", "kRt346992-72809WA", "token", "AADDERTTTECCDDDkk34699272809WWwwsdfdeeffffAADDERTTTECCDDDkk34699272809WWwwsdfdeeffffAADDERTTTECCDDDkk34699272809WWwwsdfdeeffff", "user", "userTst", "operator", "APP"]);
    hmset(["tokenpnsCaixaAPP:kRt346992-72809WC", "application", "CaixaAPP", "contract", "PUSHLOWEB", "uuiddevice", "kRt346992-72809WA", "token", "AADDERTTTECCDDDkk34699272809WWwwsdfdeeffffAADDERTTTECCDDDkk34699272809WWwwsdfdeeffffAADDERTTTECCDDDkk34699272809WWwwsdfdeeffff", "user", "userTst", "operator", "MIC"]);
    hmset(["tokenpnsCaixaAPP:kRt346992-72809WD", "application", "CaixaAPP", "contract", "PUSHLOWEB", "uuiddevice", "kRt346992-72809WA", "token", "AADDERTTTECCDDDkk34699272809WWwwsdfdeeffffAADDERTTTECCDDDkk34699272809WWwwsdfdeeffffAADDERTTTECCDDDkk34699272809WWwwsdfdeeffff", "user", "userTst", "operator", "GOO"]);
    hmset(["tokenpnsCaixaAPP:kRt346992-72809WE", "application", "CaixaAPP", "contract", "PUSHLOWEB", "uuiddevice", "kRt346992-72809WA", "token", "AADDERTTTECCDDDkk34699272809WWwwsdfdeeffffAADDERTTTECCDDDkk34699272809WWwwsdfdeeffffAADDERTTTECCDDDkk34699272809WWwwsdfdeeffff", "user", "userTst", "operator", "GOO"]);
}



const loadRedisForTesting = async () => {
    //SMS CONTRACTS
    saveSMSDefaultContract(false);
    //PNS CONTRACTS    
    savePNSDefaultContract(false);   
    //Collectors PNS
    saveAllPNSDefaultCollectors(false);
    //Collectors SMS
    saveAllSMSDefaultCollectors(false);
    //PNS token
    savePNSDefaultTokenPns(false);
    //SMS telf
    saveSMSDefaultTelfSms(false);
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
        if ((last + 360000) < now) {
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
    if (!await get("resetAllProcessedErrors")) resetAllProcessedErrors();
    set("resetAllProcessedErrors", 1);
    initRedisPNSConf();
    initRedisSMSConf();
}

module.exports = { loadRedisConf, loadRedisConfDependsOnDate, resetAllProcessedErrors }