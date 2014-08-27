"use strict";

var debug = require('debug')('mors:response');
var util = require('util');
var EventEmitter = require('events').EventEmitter;

module.exports = Response;

function Response(client) {
    if (!(this instanceof Response)) return new Response(client);

    EventEmitter.call(this);

    this.client = client;
    this.server = client.server;
    this._packet = {};

    this.init();
}

util.inherits(Response, EventEmitter);

Response.prototype.init = function () {
    var res = this;
    this.server.on('published', function (packet, client) {
        res.emit('published');
    });
};

Response.prototype.topic = function (topic) {
    this._packet.topic = topic;
    return this;
};

Response.prototype.payload = function (payload) {
    this._packet.payload = payload;
    return this;
};

Response.prototype.qos = function (qos) {
    this._packet.qos = qos;
    return this;
};

Response.prototype.retain = function (retain) {
    this._packet.retain = retain;
    return this;
};

Response.prototype._publish = function (packet, callback) {
    return this.server.publish(packet, this.client, callback);
};

Response.prototype.publish = function (message, callback) {
    if (typeof message === 'function') {
        callback = message;
        message = null;
    }
    if (!this._packet.topic) {
        return debug('Topic has not been specified.');
    }
    this._packet.payload = message || this._packet.payload || '';

    this._publish(this._packet, callback);
    return this;
};
