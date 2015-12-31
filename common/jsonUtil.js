var _ = require('lodash');
var util = require('./util');
var LogicError = require('./errors').LogicError;

var nodetypes = require('./nodetypes');

// ------------------------------------------Param Schema Sample----------------------------------------
var SubItemSchemaSample = {
	param_string:{type:String},
	param_number:{type:Number, sourceName:'i'}
};

var ParamSchemaSample = {
	param_string:{type:String, sourceName:'ParamString' },
	param_number:{type:Number},
	param_float:{type:nodetypes.Float},
	param_date:{type:Date},
	param_boolean:{type:Boolean},
	param_array:{type:Array, itemType: SubItemSchemaSample }
};


// ------------------------------------------ Util ----------------------------------------------------
var JsonUtil = function(){

};

JsonUtil.prototype.isBaseType=function(type) {
	switch(type) {
		case String:
		case Number:
		case nodetypes.Float:
		case Date:
		case Boolean:
			return true;
		default:
			return false;
	}
};

JsonUtil.prototype.getBaseTypeDefaultValue = function(type) {
	switch(type){
		case String:
			return "";
		case Number:
		case nodetypes.Float:
			return 0;
		case Date:
			return new Date(0);
		case Boolean:
			return false;
		default:
			throw new LogicError("getBaseTypeDefaultValue - type [{0}] was not supported.".format(type), 500000);
	}
};

JsonUtil.prototype.getBaseTypeValue = function(paramName, value, type, required, defaultValue) {
	//非空检测
	if(required && util.isNullOrEmpty(value)) throw new LogicError("格式化实体数据缺少参数[{0}]".format(paramName), 400023);

	if(util.isNullOrEmpty(value)) return defaultValue || this.getBaseTypeDefaultValue(type);

	switch(type){
		case Number:
			value = parseInt(value);
			value = isNaN(value) ? defaultValue || this.getBaseTypeDefaultValue(type) : value;
			break;
		case nodetypes.Float:
			value = parseFloat(value);
			value = isNaN(value) ? defaultValue || this.getBaseTypeDefaultValue(type) : value;
			break;
		case Boolean:
			value = value.toString() == "1" || value.toString().toLowerCase() == "true";
			break;
	}
	return value;
};

JsonUtil.prototype.getItemValue = function(itemValue, itemType, convertor, index) {
	var ret;
	if(convertor) return convertor(itemValue, index);
	if(this.isBaseType(itemType)) {
		ret = this.getBaseTypeValue(null, itemValue, itemType);
	} else {
		ret = {};
		for(var paramName in itemType) {
			var subItemSchema = itemType[paramName];
			var sourceParamName = subItemSchema.sourceName || paramName;
			if(this.isBaseType(subItemSchema.type)) {
				ret[paramName] = this.getBaseTypeValue(sourceParamName, itemValue[sourceParamName], subItemSchema.type, subItemSchema.required, subItemSchema.defaultValue);
			} else if(subItemSchema.type == Array) {
				// 递归
				ret[paramName] = this.getArray(itemValue[sourceParamName], subItemSchema.itemType, subItemSchema.convertor);
			}
		}
	}
	return ret;
};

JsonUtil.prototype.getArray=function(arrayValue, itemType, convertor) {
	var ret = [];
	var i = 0;
	for(var itemValue in arrayValue) {
		ret.push(this.getItemValue(arrayValue[itemValue], itemType, convertor, i++));
	}
	return ret;
};


/**
 * 按照目标Json对象的属性描述，从source json对象进行复制
 * 复制过程做如下处理：
 * 1.属性名转换
 * 2.过滤(过滤掉多余的属性)
 * 3.类型转换
 **/
var copy = function(source, destSchema) {
	var param = new JsonUtil();
	var ret = {};
	if(!source) return source;
	for(var paramName in destSchema) {
		var subItemSchema = destSchema[paramName];
		var sourceParamName = subItemSchema.sourceName || paramName;
		if(param.isBaseType(subItemSchema.type)) {
			ret[paramName] = param.getBaseTypeValue(sourceParamName, source[sourceParamName], subItemSchema.type, subItemSchema.required, subItemSchema.defaultValue);
		} else if(subItemSchema.type == Array) {
			// 递归
			ret[paramName] = param.getArray(source[sourceParamName], subItemSchema.itemType, subItemSchema.convertor);
		}else{
			ret[paramName] = param.getItemValue(source[sourceParamName], subItemSchema.itemType);
		}
	}
	return ret;
};

var copyArray = function(source, destSchema) {
	var ret = [];
	if(!source) return source;
	for(var i=0; i<source.length; i++){
		ret.push(copy(source[i], destSchema));
	}
	return ret;
};

var clone = function(source) {
	if(!source) return source;
	return _.clone(source, true);
};
// ------------------------------------------ exports --------------------------------------------------
exports.copy = copy;
exports.copyArray = copyArray;
exports.clone = clone;
