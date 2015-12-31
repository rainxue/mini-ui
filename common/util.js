var URL = require('url');
var os = require('os');
var log = require('./log');
var Q = require('q');
var thisMod = this;
var http = require('http');
var config = require('../config');
var bitsecond = 10;
var LogicError = require('./errors').LogicError;


String.prototype.format = function(args) {
    var result = this;
    if (arguments.length > 0) {
        if (arguments.length == 1 && typeof(args) == "object") {
            for (var key in args) {
                if (args[key] != undefined) {
                    var reg = new RegExp("({" + key + "})", "g");
                    result = result.replace(reg, args[key]);
                }
            }
        } else {
            for (var i = 0; i < arguments.length; i++) {
                if (arguments[i] != undefined) {
                    var reg = new RegExp("({[" + i + "]})", "g");
                    result = result.replace(reg, arguments[i]);
                }
            }
        }
    }
    return result;
}

var StringBuilder = function(str) {
    this.cache = [];
    this.append(str);
}

StringBuilder.prototype = {
    append: function(str) {
        if (str) this.cache.push(str);
    },
    clear: function() {
        this.cache.length = 0;
    },
    toString: function() {
        return this.cache.join('');
    }
}

exports.StringBuilder = StringBuilder;

exports.getBase64 = function(str) {
    return (new Buffer(str)).toString('base64');
}
exports.getUnBase64 = function(str) {
    return (new Buffer(str, 'base64')).toString();
}
exports.extend = function() {
    var ret = {};
    for (var x in arguments) {
        var obj = arguments[x];
        for (var attr in obj) {
            ret[attr] = obj[attr];
        }
    }
    return ret;
}

exports.isNullOrEmpty = function(obj) {
    return obj == undefined || obj == null || (typeof(obj) == 'string' && obj == "");
}
//console.log("".toString()=="");
// 支持arr项的末尾带*
exports.urlMatching = function(url, arr) {
    if (!url || !arr) {
        return false;
    }
    for (var i = 0; i < arr.length; i++) {
        if (new RegExp(arr[i], "gi").test(url)) {
            return true;
        }
    }
    return false;
};

exports.removeUrlParam = function(url, param) {
    var i = url.indexOf("?" + param + "=");
    if (i < 0) i = url.indexOf("&" + param + "=");
    if (i < 0) return url;

    var str1 = url.substr(0, i + 1);
    var str2 = url.substr(i + param.length + 1);
    var j = str2.indexOf("&");
    if (j < 0) {
        return str1;
    } else {
        return str1 + str2.substr(j + 1);
    }
};


var NodeParam = function(req) {
    this._url = req.url;
    this._query;
    this._body = req.body;
}

NodeParam.prototype.get = function(key) {
    if (!this._query) {
        this._query = URL.parse(this._url, true).query;
    }
    var rtnData = null;
    if (this._query[key]) {
        rtnData = this._query[key];
    } else {
        rtnData = this._body[key];
    }
    //兼容url传参数，全部处理成字符串
    rtnData = (rtnData == null || rtnData == undefined) ? rtnData : rtnData.toString();
    return rtnData;
}
exports.NodeParam = NodeParam;

