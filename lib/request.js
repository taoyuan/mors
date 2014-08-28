"use strict";

var util = require('util');
var EventEmitter = require('events').EventEmitter;
var methods = require('./methods');

module.exports = Request;

function Request(client, topicOrPacket) {
    if (!(this instanceof Request)) return new Request(client, topicOrPacket);

    EventEmitter.call(this);

    this.client = client;
    var topic;

    if (typeof topicOrPacket === 'string') {
        topic = topicOrPacket
    } else if (typeof topicOrPacket === 'object') {
        topic = topicOrPacket.topic;
        this.payload = Buffer.isBuffer(topicOrPacket.payload) ? topicOrPacket.payload.toString() : topicOrPacket.payload;
        this.qos = topicOrPacket.qos;
        this.retain = topicOrPacket.retain;
    }

    if (topic) {
        try { this.topic = decodeURI(topic) }
        catch (ex) { this.topic = null }
    }
}

util.inherits(Request, EventEmitter);

methods.forEach(function (method) {
    Request[method] = function() {
        var req = Request.apply(null, arguments);
        req.method = method;
        return req;
    }
});