// dev, test, release
var runMode = "dev";

var config;
var extend = function() {
  var ret ={};
  for(var x in arguments){
    var obj = arguments[x];
    for(var attr in obj){
        ret[attr] = obj[attr];
    }
  }
  return ret;
}
switch(runMode) {
	case "dev":
		config = require('./configs/config.dev');
		break;
	case "release":
		config = require('./configs/config.release');
		break;
}

var commonConfig = require('./configs/config.common').commonConfig;

config = extend(config, commonConfig);
config.runMode = runMode;
module.exports = config;
module.exports.config = config;