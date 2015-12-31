var config = require('../config').config;
var log4js = require('log4js');

log4js.configure({
  appenders: [
    { 
    	type: 'dateFile', 
    	filename: config.log.local.filename,// + "." + process.pid,
        "pattern": config.log.local.pattern, 
        alwaysIncludePattern:true,
    	category: 'default'
    }
  ]
});

var log = log4js.getLogger('default');

var level = config.log.local.level;
if(level == "WARNING") level = "WARN";
log.setLevel(level);

var debug = function (module, msg) {
    log.debug("[" + module + "] " + msg);
}

var info = function (module, msg) {
    log.info("[" + module + "] " + msg);
}

var warning = function (module, msg) {
    log.warn("[" + module + "] " + msg);
}

var error = function (module, msg, exp, stack) {
    var str = "[" + module + "] " + msg;
    if (exp) str += "\n" + exp;
    if (stack) str += "\n" + stack;
    log.error(str);
}

var fatal = function (module, msg, exp, stack) {
    var str = "[" + module + "] " + msg;
    if (exp) str += "\n" + exp;
    if (stack) str += "\n" + stack;
    log.critical(str);
}

exports.debug = debug;
exports.info = info;
exports.warning = warning;
exports.error = error;
exports.fatal = fatal;