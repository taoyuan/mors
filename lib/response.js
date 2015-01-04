"use strict";

var debug = require('debug')('mors:response');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var utils = require('./utils');

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

Response.prototype.publish = function (message, callback) {
    if (typeof message === 'function') {
        callback = message;
        message = null;
    }
    if (!this._packet.topic) {
        return debug('Topic has not been specified.');
    }

    if (utils.isNullOrUndefined(message)) {
        message = this._packet.payload;
    }

    if (utils.isNullOrUndefined(message)) {
        message = '';
    }

    switch (typeof message) {
        case 'boolean':
        case 'number':
        case 'object':
            if (!Buffer.isBuffer(message)) {
                return this.json(message, callback);
            }
            break;
    }

    this._packet.payload = message;

    this._publish(this._packet, callback);
    return this;
};

Response.prototype.json = function (obj, callback) {
    return this.publish(JSON.stringify(obj), callback);
};

Response.prototype._finish = function () {
    this.emit('finish');
};

Response.prototype.end = function () {
    if (this.finished) return;
    this.finished = true;
    this._finish();
};
