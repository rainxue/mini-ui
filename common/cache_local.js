var LRU = require("lru-cache");
var options = {
	max: 500,
	maxAge: 1000 * 3600 * 4
};
var cache = LRU(options);
var Q = require('q');
exports.set = function(key, value) {
	return Q.fcall(function() {
		return cache.set(key, value);
	});
};

exports.get = function(key) {
	return Q.fcall(function() {
		return cache.get(key);
	});
};
exports.setSynchro = function(key, value) {
	return cache.set(key, value);
};

exports.getSynchro = function(key) {
	return cache.get(key);
};

