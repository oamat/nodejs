//Dependencies
const { hget, hset, hmset, lpush, sadd, set, get, rpop, rpoplpush, hgetOrNull } = require('./redisconf');
const { logTime} = require('./formats');
const { findSMS, findAllSMS, findContractSms, findAllContractSms, saveContractSms, findCollectorSms, findAllCollectorSms, saveCollectorSms, updateCollectorSms, findTelfSms, findAllTelfSms, saveTelfSms, updateTelfSms } = require('../util/mongomultisms');
const { findPNS, findAllPNS, findContractPns, findAllContractPns, saveContractPns, findCollectorPns, findAllCollectorPns, saveCollectorPns, updateCollectorPns, findTokenPns, findAllTokenPns, saveTokenPns, updateTokenPns } = require('../util/mongomultipns');
//VARS


//Methods
const initRedisSMSConf = async () => {
    //select and save all SMS collectors
    let collectors = await findAllCollectorSms({ activated: true });
    for (var i = 0; i < collectors.length; i++) {
        hmset(["collectorsms:" + collectors[i].name,
            "status", (collectors[i].status ? 1 : 0),
            "interval", collectors[i].interval,
            "intervalControl", collectors[i].intervalControl,
            "operator", collectors[i].operator
        ]);
    }


    //select and save all SMS contracts
    let contracts = await findAllContractSms({ activated: true });
    for (var i = 0; i < contracts.length; i++) {
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
    for (var i = 0; i < contractsAdmin.length; i++) {
        hmset(["contractadmin:" + contractsAdmin[i].name,
            "jwt", contractsAdmin[i].jwt,
            "permission", contractsAdmin[i].permission,
            "type", contractsAdmin[i].type
        ]);
    }
    //select and save all SMS telfs (huge documents)
}

const initRedisPNSConf = async () => {
    //select and save all PNS collectors
    let collectors = await findAllCollectorPns({ activated: true });
    for (var i = 0; i < collectors.length; i++) {
        hmset(["collectorpns:" + collectors[i].name,
            "status", (collectors[i].status ? 1 : 0),
            "interval", collectors[i].interval,
            "intervalControl", collectors[i].intervalControl,
            "operator", collectors[i].operator
        ]);
    }
    //select and save all PNS contracts
    let contracts = await findAllContractPns({ activated: true });
    for (var i = 0; i < contracts.length; i++) {
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
    for (var i = 0; i < contractsAdmin.length; i++) {
        hmset(["contractadmin:" + contractsAdmin[i].name,
            "jwt", contractsAdmin[i].jwt,
            "permission", contractsAdmin[i].permission,
            "type", contractsAdmin[i].type
        ]);
    }
    //select and save all PSN tokens (huge documents)
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


const loadRedisConf = async () => {
    initRedisPNSConf();
    initRedisSMSConf();
}

module.exports = { loadRedisConf, loadRedisConfDependsOnDate }