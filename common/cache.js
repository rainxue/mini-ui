var config = require('../config').config;
var Q = require("q");
var log = require("./log");
var util = require("./util");
var redis = require("redis"),
    client = redis.createClient(config.redisPort, config.redisHost);
client.select(config.redisDatabase, function(err) {
    if (err) {
        var errInfo = "select database - " + config.redisDatabase + " - " + err;
        //console.log(errInfo);
        log.error("redis", errInfo);

    }
});
var errorFun = function(err) {
    var errInfo = "error event - " + client.host + ":" + client.port + " - " + err;
    log.error("redis", errInfo);
    //失败后重新选择库
    if (err) {
        setTimeout(function() {
            log.info("redis", 'redis auto_reselectdb------!');
            client = redis.createClient(config.redisPort, config.redisHost);
            client.select(config.redisDatabase, function(err) {
                if (err) {
                    log.info("redis", "redis auto_reselectdb fail!");
                } else {
                    log.info("redis", 'redis auto_reselectdb success!');
                }
            });
            client.on("error", errorFun);
        }, config.dbreconnettime);
    }
};

client.on("error", errorFun);

exports.client = client;

var getObj = function(key) {
    var deferred = Q.defer();
    client.get(key, function(err, str) {
        if (err) {
            deferred.reject(err);
            return;
        }
        try {
            if (str == null || str == "") {
                return deferred.resolve(null);
            }
            var ret = JSON.parse(str);
            deferred.resolve(ret);
        } catch (err) {
            deferred.reject(err);
        }
    });
    return deferred.promise;
}

var getStr = function(key) {

    return Q.ninvoke(client, "get", key);
}
exports.otherCmd = function(cmd, key) {

    return Q.ninvoke(client, cmd, key);
}

var setObj = function(key, obj, expireTime) {
    return setStr(key, JSON.stringify(obj), expireTime)
        .then(function() {
            return obj;
        });
}

var setStr = function(key, str, expireTime) {
    if (expireTime) {
        return Q.ninvoke(client, "set", key, str)
            .then(function() {
                return expire(key, expireTime);
            })
            .then(function() {
                return str;
            });
    } else {
        return Q.ninvoke(client, "set", key, str)
            .then(function() {
                return str;
            });
    }
}

var expire = function(key, expireTime) {
    return Q.ninvoke(client, "expire", key, expireTime);
}

var remove = function(key) {
    client.del(key);
}

exports.getObj = getObj;
exports.getStr = getStr;
exports.setObj = setObj;
exports.setStr = setStr;
exports.expire = expire;
exports.remove = remove;