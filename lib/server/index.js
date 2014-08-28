"use strict";

require('./client');

var util = require('util');
var mosca = require('mosca');
var Request = require('../request');
var Response = require('../response');

function toNumber(x) { return (x = Number(x)) >= 0 ? x : false; }

module.exports = Server;

function Server(handler, opts, callback) {
    if (!(this instanceof Server)) {
        return new Server(handler, opts, callback);
    }
    if (!handler || !handler.handle || !handler.use) {
        callback = opts;
        opts = handler;
        handler = null;
    }
    if (typeof opts === 'function') {
        callback = opts;
        opts = null;
    }
    if (typeof opts == 'number') {
        opts = { port: toNumber(opts) };
    }
    opts = opts || {};

    if (handler) {
        this.on('subscribed', function (topic, client) {
            handler(Request.subscribe(client, topic), Response(client));
        });
        this.handlePublish = function (client, packet) {
            handler(Request.publish(client, packet), Response(client));
        };
        if (handler.authenticate) this.authenticate = handler.authenticate;
        if (handler.authorizePublish) this.authorizePublish = handler.authorizePublish;
        if (handler.authorizeSubscribe) this.authorizeSubscribe = handler.authorizeSubscribe;
    }

    this.once('ready', function (){
        this.isReady = true;
    });

    mosca.Server.call(this, opts, callback);
}

util.inherits(Server, mosca.Server);

Server.prototype.toString = function() {
    return 'mors/mosca.Server';
};

Server.prototype.ready = function(cb) {
    if (this.isReady) return cb();
    this.once('ready', cb);
};
