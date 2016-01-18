var config = require('../config').config;
var log = require('../common/log');

exports.index = function(req, res, next) {
	log.debug("site", "index in.");
	return res.send("welcome to lcms local service.");
};

exports.config = function(req, res, next) {
	var result = {
		icplayer_path: config.icplayer_path
	};
	return res.send(result);
};


