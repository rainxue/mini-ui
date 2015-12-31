var config = require('../config').config;
var localLog = require('./log4js');
var ErrorUtil = require("../common/errors");

var debug = function (module, msg) {
    localLog.debug(module, msg);
}

var info = function (module, msg) {
    localLog.info(module, msg);
}

var warning = function (module, msg) {
    localLog.warning(module, msg);
}

var _error = function(module, errObj){
    localLog.error(module, errObj.message, "", errObj.stack);
}

var error = function (module, msg, exp, stack) {
    if(msg instanceof ErrorUtil.LogicError) return;
    if(msg instanceof Error) return _error(module, msg);
    localLog.error(module, msg, exp, stack);
}

var fatal = function (module, msg, exp, stack) {
    localLog.fatal(module, msg, exp, stack);
}

exports.debug = debug;
exports.info = info;
exports.warning = warning;
exports.error = error;
exports.fatal = fatal;

