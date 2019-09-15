//Dependencies
const { hmset, set, get } = require('./redisconf');
const { logTime } = require('./formats');
const { findAllContractSms, findAllCollectorSms, findAllTelfSms, } = require('../util/mongomultisms');
const { findAllContractPns, findAllCollectorPns, findAllTokenPns, } = require('../util/mongomultipns');
//VARS


//Methods
const initRedisSMSConf = async () => {
    //select and save all SMS collectors
    let collectors = await findAllCollectorSms({ activated: true });
    if (!collectors || collectors.length == 0) console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "SMS Collectors not found in MongoDB...");
    else for (var i = 0; i < collectors.length; i++) {
        hmset(["collectorsms:" + collectors[i].name,
            "status", (collectors[i].status ? 1 : 0),
            "interval", collectors[i].interval,
            "intervalControl", collectors[i].intervalControl,
            "operator", collectors[i].operator
        ]);
    }


    //select and save all SMS contracts
    let contracts = await findAllContractSms({ activated: true });
    if (!contracts || contracts.length == 0) console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "SMS Contracts not found in MongoDB...");
    else for (var i = 0; i < contracts.length; i++) {
        hmset(["contractsms:" + contracts[i].name,
            "jwt", contracts[i].jwt,
            "operator", contracts[i].operator,
            "interface", contracts[i].interface,
            "permission", contracts[i].permission,
            "type", contracts[i].type
        ]);
    }

    //select and save all SMS contracts ADMIN
    let contractsAdmin = await findAllContractSms({ activated: true, permission: "ADMIN" });
    if (!contractsAdmin || contractsAdmin.length == 0) console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "SMS Contracts Admin not found in MongoDB...");
    else for (var i = 0; i < contractsAdmin.length; i++) {
        hmset(["contractadmin:" + contractsAdmin[i].name,
            "jwt", contractsAdmin[i].jwt,
            "permission", contractsAdmin[i].permission,
            "type", contractsAdmin[i].type
        ]);
    }
    //select and save all SMS telfs (huge documents)
    let telfs = await findAllTelfSms({});
    if (!telfs || telfs.length == 0) console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "SMS telfs not found in MongoDB...");
    else for (var i = 0; i < telfs.length; i++) {
        hmset(["telfsms:" + telfs[i].telf,  //TODO: change key operator by .telf
            "operator", telfs[i].operator
        ]);
    }
}

const initRedisPNSConf = async () => {
    //select and save all PNS collectors
    let collectors = await findAllCollectorPns({ activated: true });
    if (!collectors || collectors.length == 0) console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "PNS Collectors not found in MongoDB...");
    else for (var i = 0; i < collectors.length; i++) {
        hmset(["collectorpns:" + collectors[i].name,
            "status", (collectors[i].status ? 1 : 0),
            "interval", collectors[i].interval,
            "intervalControl", collectors[i].intervalControl,
            "operator", collectors[i].operator
        ]);
    }
    //select and save all PNS contracts
    let contracts = await findAllContractPns({ activated: true });
    if (!contracts || contracts.length == 0) console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "PNS Contracts not found in MongoDB...");
    else for (var i = 0; i < contracts.length; i++) {
        hmset(["contractpns:" + contracts[i].name,
            "jwt", contracts[i].jwt,
            "operator", contracts[i].operator,
            "interface", contracts[i].interface,
            "permission", contracts[i].permission,
            "type", contracts[i].type
        ]);
    }

    //select and save all SMS contracts ADMIN
    let contractsAdmin = await findAllContractPns({ activated: true, permission: "ADMIN" });
    if (!contractsAdmin || contractsAdmin.length == 0) console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "PNS Contracts Admin not found in MongoDB...");
    else for (var i = 0; i < contractsAdmin.length; i++) {
        hmset(["contractadmin:" + contractsAdmin[i].name,
            "jwt", contractsAdmin[i].jwt,
            "permission", contractsAdmin[i].permission,
            "type", contractsAdmin[i].type
        ]);
    }
    //select and save all PSN tokens (huge documents)
    let tokens = await findAllTokenPns({});
    if (!tokens || tokens.length == 0) console.log(process.env.YELLOW_COLOR, logTime(new Date()) + "PNS Tokens not found in MongoDB...");
    else for (var i = 0; i < tokens.length; i++) {
        hmset(["tokenpns:" + tokens[i].application + tokens[i].uuiddevice,
            "token", tokens[i].token,   //TODO: change key token by application+":"+uuiddevice
            "operator", tokens[i].operator
        ]);
    }
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
        if ((last + 36) < now) {
            initRedisPNSConf();
            initRedisSMSConf();
            set("lastLoadRedisConf", now);
            console.log(process.env.GREEN_COLOR, logTime(new Date()) + "Loading all Data in RedisConf...");
        } else {
            console.log(process.env.GREEN_COLOR, logTime(new Date()) + "Loaded all Data in RedisConf before an hour.");
        }
    }
}

const loadRedisForTesting = async () => {
    //APIADMIN
    redisconf.hset("contractadmin:ADMIN", "jwt", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFETUlOIiwiY29udHJhY3QiOiJBRE1JTiIsImlhdCI6MjAxNjIzOTAyMn0.vwBNTaBbW40v14Iiqd65uhv4FVQi4qn4ZH50VyQ00rg");

    //APIPNS Contracts
    redisconf.hmset(["contractpns:PUSHLOWEB",
        "jwt", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlBVU0hMT1dFQiIsImNvbnRyYWN0IjoiUFVTSExPV0VCIiwiaWF0IjoyMDE2MjM5MDIyfQ.liOxBh3kFQyjYrIyhg2Uu3COoV83ruUsyLniWEJ8Apw",
        "operator", "ALL"
    ]);

    //APISMS Contracts
    redisconf.hmset(["contractsms:OTPLOWEB",
        "jwt", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6Ik9UUExPV0VCIiwiY29udHJhY3QiOiJPVFBMT1dFQiIsImlhdCI6MjAxNjIzOTAyMn0.BK58iwYbyfGb1u--SLP3YZP7JZxKSMrPHmdc-gfH4t4",
        "operator", "ALL"
    ]);

    //batchSMS
    redisconf.hmset(["collectorsms:batchSMS",
        "status", "1",
        "interval", "2000",
        "intervalControl", "30000"
    ]);

    //batchPNSs
    redisconf.hmset(["collectorsms:batchPNS",
        "status", "1",
        "interval", "2000",
        "intervalControl", "30000"
    ]);

    //Collectors Apple
    redisconf.hmset(["collectorpns:APP",
        "status", "1",
        "interval", "2000",
        "intervalControl", "30000",
        "operator", "APP"
    ]);

    //Collectors Android
    redisconf.hmset(["collectorpns:GOO",
        "status", "1",
        "interval", "2000",
        "intervalControl", "30000",
        "operator", "GOO"
    ]);

    //Collectors Microsoft
    redisconf.hmset(["collectorpns:MIC",
        "status", "1",
        "interval", "2000",
        "intervalControl", "30000",
        "operator", "MIC"
    ]);


    //Collectors Movistar
    redisconf.hmset(["collectorsms:MOV",
        "status", "1",
        "interval", "2000",
        "intervalControl", "30000",
        "operator", "MOV"
    ]);

    //Collectors MovistarVIP
    redisconf.hmset(["collectorsms:VIP",
        "status", "1",
        "interval", "2000",
        "intervalControl", "30000",
        "operator", "VIP"
    ]);

    //Collectors ORANGE
    redisconf.hmset(["collectorsms:ORA",
        "status", "1",
        "interval", "2000",
        "intervalControl", "30000",
        "operator", "ORA"
    ]);

    //Collectors VODAFONE
    redisconf.hmset(["collectorsms:VOD",
        "status", "1",
        "interval", "2000",
        "intervalControl", "30000",
        "operator", "VOD"
    ]);

    //PNS token
    redisconf.hmset(["tokenpnsCaixaAPP:kRt346992-72809WA",
        "token", "AADDERTTTECCDDDkk34699272809WWwwsdfdeeffffAADDERTTTECCDDDkk34699272809WWwwsdfdeeffffAADDERTTTECCDDDkk34699272809WWwwsdfdeeffff",
        "operator", "GOO"
    ]);

    //SMS telf
    redisconf.hmset(["telfsms:0034699272800",
        "operator", "VOD"
    ]);
}

const loadRedisConf = async () => {
    initRedisPNSConf();
    initRedisSMSConf();
}

module.exports = { loadRedisConf, loadRedisConfDependsOnDate, loadRedisForTesting }