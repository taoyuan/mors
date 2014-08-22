"use strict";

module.exports = Response;

function Response(client) {
    if (!(this instanceof Response)) return new Response(client);
    this.client = client;
    this.server = client.server;
    this._packet = {};
}

Response.prototype.packet = function (packet) {
    this._packet = packet || {};
    return this;
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

Response.prototype.publish = function (topic, message, callback) {
    var lastArg = arguments[arguments.length - 1];
    if (typeof lastArg === 'function') {
        callback = lastArg;
    }

    if (typeof topic === 'function' || arguments.length === 0) {
        // noop
    } else if (typeof message === 'function' || arguments.length === 1) {
        this._packet.payload = topic;
    } else if (typeof callback === 'function' || arguments.length === 2) {
        this._packet.topic = topic;
        this._packet.payload = message;
    }

    this.server.publish(this._packet, this.client, callback);
};