var util = require('./util');
var LogicError = require('./errors').LogicError;
var URL = require('url');
var log = require('./log');
var nodetypes = require('./nodetypes');
var jsonUtil = require('./jsonUtil');

exports.apiResult = function(data, code) {
	if (code == undefined) {
		return {
			code: 0,
			message: '',
			data: data
		};
	} else {
		return {
			code: code,
			message: data.toString(),
			data: null
		};
	}
};

var getJsonpCallback = function(req) {
	var params = URL.parse(req.url, true).query;
	return params["callback"] || params["jsoncallback"] || params["jsonpcallback"];
};

var handleJsonp = function(req, res, result) {
	var callback = getJsonpCallback(req);
	if(callback) {
		res.set('Content-Type', 'application/x-javascript;charset=utf-8');
		return callback + '(' + JSON.stringify(result) + ')';
	} else {
		res.set('Content-Type', 'application/json;charset=utf-8');
		return (result);
	}
};

var returnOpenApiResult = function(req, res, data) {
	res.send(handleJsonp(req, res, {code:0, message:"", data: data}));
};
exports.returnOpenApiResult = returnOpenApiResult;

var returnOpenApiErrorResult = function(req, res, error) {
	var oldError = error;
	if (!(error instanceof LogicError)) {

		error = {
			message:"服务器异常:" + (error.code ? error.message : error),
			code: 500000,
			data:null
		};
		log.error("openapi", "[{2}][{0}]{1}".format(req.url,error.message,req.method),null,oldError.stack);
	}else{
		log.info("openapi", "[{2}][{0}]{1}".format(req.url,error.message,req.method),null,oldError.stack);
	}
	
	res.send(handleJsonp(req, res, {code:error.code,message:error.message,data:error.data}));
	res.end();
};
exports.returnOpenApiErrorResult = returnOpenApiErrorResult;

exports.getAction = function(action,resModel) {
	return function(req, res, next) {
		try {
			var act = action(req, res, next);
			if(act && act.fail){
				act
				.then(function(rtnData) {
					if(resModel){
						rtnData = Array.isArray(rtnData)?jsonUtil.copyArray(rtnData, resModel):jsonUtil.copy(rtnData, resModel);
					}
					returnOpenApiResult(req, res, rtnData);
				})
				.fail(function(error) {
					//return ErrorUtil.failRes(res, error);
					returnOpenApiErrorResult(req, res, error);
				});
			}
		} catch (error) {
			returnOpenApiErrorResult(req, res, error);
		}
	}
};

// 通过预定义的json对象统一处理入参和出参
/*
var paramSchemaSample = {
	param_string:{type:String, required:true },
	param_number:{type:Number},
	param_float:{type:nodetypes.Float},
	param_date:{type:Date},
	param_boolean:{type:Boolean},
	param_array:{type:Array, itemType: SubItemSchemaSample }
};

var SubItemSchemaSample = {
	param_string:{type:String},
	param_number:{type:Number}
};

//var ArraySchemaSample = {type:Array, itemType: SubItemSchemaSample }
*/
var OpenApiParamManager = function(req) {
    this._url = req.url;
    this._query ;
    this._body = req.body;
    this._req = req;
};

// 支持从form、body(json)、url参数、url地址中获取参数
OpenApiParamManager.prototype.get = function(key) {
    if(!this._query){
        this._query = URL.parse(this._url, true).query;
    }
    var rtnData = null;
    if(this._query[key]){
        rtnData = this._query[key];
    }else if(this._body[key]){
        rtnData = this._body[key];
    } else {
    	rtnData = this._req.param(key);
    }
    //兼容url传参数，全部处理成字符串
    //rtnData = (rtnData==null||rtnData==undefined)?rtnData:rtnData.toString();
    return rtnData;
};

OpenApiParamManager.prototype.getBaseTypeValue = function(paramName, value, type, required,subItemSchema) {
	//非空检测
	var oldValue = value;
	if(required && util.isNullOrEmpty(value)) throw new LogicError("请求参数缺少[{0}]".format(paramName), 400024);

	if(util.isNullOrEmpty(value)) return undefined;
	
	switch (type) {
		case Number:
			value = parseInt(value);
			value = isNaN(value) ? undefined : value;
			break;
		case nodetypes.Float:
			value = parseFloat(value);
			value = isNaN(value) ? undefined : value;
			break;
		case nodetypes.PositiveInteger:
			value = parseInt(value);
			value = isNaN(value) ? undefined : value;
			if((value!=undefined && value<0) || (value!=undefined && parseFloat(oldValue) != value)){
				throw new LogicError("请求参数[{0}]必须为非负整数".format(paramName), 400034);
			}
			break;
		case Boolean:
			value = value.toString() == "1" || value.toString().toLowerCase() == "true";
			break;
		case String:
			if (subItemSchema.maxSize != undefined && value.length > subItemSchema.maxSize) {
				throw new LogicError("请求参数[{0}]长度不能大于{1}".format(paramName, subItemSchema.maxSize), 400027);
			}
			break;
	}
	return value;
};

OpenApiParamManager.prototype.getItemValue = function(itemValue, itemType,arrayItemSchema) {
	var ret;
	if(this.isBaseType(itemType)) {
		ret = this.getBaseTypeValue(null, itemValue, itemType,false,arrayItemSchema);
	} else {
		ret = {};
		for(var paramName in itemType) {
			var subItemSchema = itemType[paramName];
			if(this.isBaseType(subItemSchema.type)) {
				ret[paramName] = this.getBaseTypeValue(paramName, itemValue[paramName], subItemSchema.type, subItemSchema.required,subItemSchema);
			} else if(subItemSchema.type == Array) {
				// 递归
				ret[paramName] = this.getArray(paramName, itemValue[paramName], subItemSchema.itemType, subItemSchema.required,subItemSchema);
			}
		}
	}
	return ret;
};

OpenApiParamManager.prototype.getArray = function(paramName, arrayValue, itemType, required,subItemSchema) {
	if(required && !arrayValue) throw new LogicError("请求参数数组缺少[{0}]".format(paramName), 400025);
	var ret = [];
	if (!util.isNullOrEmpty(arrayValue)) {
		if (Array.isArray(arrayValue)) {
			// var nameObj = {};
			for (var itemValue in arrayValue) {
				// if(!nameObj[arrayValue[itemValue]]){
				// 	nameObj[arrayValue[itemValue]] = 1;
				ret.push(this.getItemValue(arrayValue[itemValue], itemType,subItemSchema));
				// }
			}
		} else {
			ret.push(arrayValue);
		}
	}
	return ret;
};
OpenApiParamManager.prototype.isBaseType=function(type) {
	switch(type) {
		case String:
		case Number:
		case nodetypes.Float:
		case nodetypes.PositiveInteger:
		case Date:
		case Boolean:
			return true;
		default:
			return false;
	}
};

var getOpenApiParam = function(req, paramSchema) {
	var param = new OpenApiParamManager(req);
	var ret = {};
	for(var paramName in paramSchema) {
		var subItemSchema = paramSchema[paramName];
		if(param.isBaseType(subItemSchema.type)) {
			ret[paramName] = param.getBaseTypeValue(paramName, param.get(paramName), subItemSchema.type, subItemSchema.required,subItemSchema);
		} else if(subItemSchema.type == Array) {
			// 递归
			ret[paramName] = param.getArray(paramName, param.get(paramName), subItemSchema.itemType, subItemSchema.required,subItemSchema);
		}
	}
	return ret;
};

//if(paramSchema[paramName].required && util.isNullOrEmpty(value)) throw new LogicError("缺少参数[{0}]".format(paramName), 400001);
exports.getOpenApiParam = getOpenApiParam;

