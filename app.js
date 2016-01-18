//var domain = require('domain');
var express = require('express');
var bodyParser = require('body-parser');
var config = require('./config').config;
var cluster = require('cluster');
var path = require('path');
var routes = require('./routes');
var errorHandler = require('errorhandler');
var log = require('./common/log');
var app = express();
// var args = process.argv.splice(2);

// app.set('query parser fn',config.queryOption);
app.use(bodyParser());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
// app.use(require('cookie-parser')(config.cookie_secret));
//app.use(express.static(path.dirname(process.execPath) + '/static'));
app.use(express.static(__dirname + '/static'));
app.use(errorHandler({
    dumpExceptions: true,
    showStack: true
}));


//app.set('views', __dirname+'/views');
// app.set('view engine', 'html');
// app.engine('html', require('ejs-locals'));
// app.locals._layoutFile = 'layout.html';

routes(app);

if (config.processNum > 1 && cluster.isMaster) {
    log.info("app", "master start...");
    // Fork workers.
    for (var i = 0; i < config.processNum; i++) {
        var worker_process = cluster.fork();
    }
    cluster.on('listening', function(worker, address) {
        log.info("app", 'listening: worker ' + worker.process.pid + ', Address: ' + address.address + ":" + address.port);
    });
    cluster.on('exit', function(worker, code, signal) {
        log.info("app", 'worker ' + worker.process.pid + ' died');
    });
} else {
    app.listen(config.port, function(e) {
        log.info("app", "listening on port " + config.port);
    });
}

exports = app;
log.info("init", "app init ok.");