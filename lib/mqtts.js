"use strict";

var util = require('util');
var _ = require('lodash');

function Message(data) {
    if (!(this instanceof Message)) return new Message(data);
    if (data) this._init(data);
}

Message.prototype._init = function (data) {
    var message = this;
    var packet = data.packet;

    message.client = data.client;
    message.packet = data.packet;

    try { message.topic = decodeURI(packet.topic) }
    catch (ex) { message.topic = null }

    message.payload = Buffer.isBuffer(packet.payload) ? packet.payload.toString() : packet.payload;
};

function Request(client, packet) {
    if (!(this instanceof Request)) return new Request(client, packet);
    Message.call(this, {client: client, packet: packet});
}

util.inherits(Request, Message);

function Response(client) {
    if (!(this instanceof Response)) return new Response(client);
    this.client = client;
    this.server = client.server;
    this.packet = {};
}

Response.prototype.packet = function (packet) {
    this.packet = packet || {};
    return this;
};

Response.prototype.topic = function (topic) {
    this.packet.topic = topic;
    return this;
};

Response.prototype.payload = function (payload) {
    this.packet.payload = payload;
    return this;
};

Response.prototype.qos = function (qos) {
    this.packet.qos = qos;
    return this;
};

Response.prototype.retain = function (retain) {
    this.packet.retain = retain;
    return this;
};

Response.prototype.publish = function (topic, payload, callback) {
    var packet;

    var lastArg = arguments[arguments.length - 1];
    if (typeof lastArg === 'function') {
        callback = lastArg;
    }

    if (typeof topic === 'object') {
        packet = topic;
    } else {
        if (typeof topic === 'function') topic = undefined;
        if (typeof payload === 'function') payload = undefined;
        packet = { topic: topic, payload: payload };
    }
    packet = _.defaults(packet, this.packet);

    this.server.publish(packet, this.client, callback);
};

exports.Message = Message;
exports.Request = Request;
exports.Response = Response;
