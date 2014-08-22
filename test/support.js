"use strict";

var mors = require('../');
var chai = require('chai');
chai.config.includeStack = true;
var mqtt = require('mqtt');
var _ = require('lodash');

exports.t = chai.assert;

exports.donner =  function donner(n, func) {
    if (n < 1) {
        return func();
    }
    return function(err) {
        if (--n < 1) {
            func(err ? err : null);
        }
    };
};

var portCounter = 9142;
exports.nextPort = function() {
    return ++portCounter;
};

exports.setup = function (settings) {
    return function (done) {
        var test = this;
        var app = test.app = mors();
        var settings = test.settings = exports.buildSettings(settings);
        test.server = app.listen(settings, done);
    }
};

exports.teardown = function () {
    return function (done) {
        if (this.server) return this.server.close(done);
        done();
    }
};

exports.createServer = function (settings, router) {
    var app = mors();
    var server = app.listen(settings);
    server.on('message', function (client, packet) {
        router.dispatch(client, packet, function (err) {

        });
    });
    return server;
};

exports.buildSettings = function (settings) {
    return _.defaults(settings || {}, {
        port: exports.nextPort()
    });
};

function buildOpts() {
    return {
        keepalive: 1000,
        clientId: 'mors_' + require("crypto").randomBytes(8).toString('hex'),
        protocolId: 'MQIsdp'
    };
}

/**
 *
 * (port, host, opts, callback)
 */
exports.buildClient = function buildClient(done, server, opts, callback) {
    if (typeof done !== 'function') {
        callback = opts;
        opts = server;
        server = done;
        done = null;
    }
    if (typeof opts === 'function') {
        callback = opts;
        opts = {};
    }

    opts = _.defaults(opts, buildOpts());

    var client = mqtt.createClient(server.opts.port, opts);

    function end(err) {
        done(err ? err : null);
    }
    if (done) {
        client.on('error', end);
        client.on('close', end);
    }

    client.on("connect", function() {
        callback && callback(client);
    });

    return client;
};

var bunyan = require("bunyan");

exports.globalLogger = bunyan.createLogger({
    name: "moscaTests",
    level: 60
});
