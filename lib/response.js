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
}

util.inherits(Response, EventEmitter);

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

Response.prototype._finish = function () {
    this.emit('finish');
};

Response.prototype.publish = function (topic, message) {
    if (topic) this._packet.topic = topic;
    if (!this._packet.topic) {
        debug('Topic has not been specified. Just end this response');
        return this.end();
    }

    // TODO message encode (json/msgpack)?
    this.end(message || '')
};

Response.prototype.end = function (message) {
    if (this.finished) return;

    if (message && !this._packet.topic) {
        debug('Topic has not been specified. Ignoring message passed to end().');
        message = false;
    }

    if (this._packet.topic) {
        if (message) this._packet.payload = message;
        this._publish(this._packet);
    }

    this.finished = true;

    this._finish();
};
