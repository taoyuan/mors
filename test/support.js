"use strict";

var mors = require('../');
var chai = require('chai');
chai.Assertion.includeStack = true;
var mqtt = require('mqtt');
var merge = require('utils-merge');

exports.t = chai.assert;

exports.plan = function (count, done) {
    return function() {
        count--;
        if (count === 0) {
            done();
        }
    };
};

var portCounter = 9042;
exports.nextPort = function() {
    return ++portCounter;
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
    return merge({
        port: exports.nextPort()
    }, settings);
};

exports.buildOpts = function() {
    return {
        keepalive: 1000,
        clientId: 'mors_' + require("crypto").randomBytes(8).toString('hex'),
        protocolId: 'MQIsdp',
        protocolVersion: 3
    };
};

/**
 *
 * (port, host, opts, callback)
 */
exports.buildClient = function buildClient(port, host, opts, callback) {
    if (typeof port === 'function') {
        callback = port;
        port = null;
        host = null;
        opts = null;
    } else if (typeof host === 'function') {
        callback = host;
        host = null;
        opts = null;
    } else if (typeof opts === 'function') {
        callback = opts;
        opts = null;
    }
    if (typeof port === 'object') {
        opts = port;
        port = opts.port;
        host = opts.host;
    }
    opts = merge(exports.buildOpts(), opts);

    var client = mqtt.createClient(port, host, opts);

    client.on("connect", function() {
        callback(client);
    });
};