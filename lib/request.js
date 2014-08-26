"use strict";

var util = require('util');
var EventEmitter = require('events').EventEmitter;

module.exports = Request;

function Request(client, packet) {
    if (!(this instanceof Request)) return new Request(client, packet);

    EventEmitter.call(this);

    this.client = client;
    this.packet = packet;

    if (!!packet) {
        try { this.topic = decodeURI(packet.topic) }
        catch (ex) { this.topic = null }

        this.payload = Buffer.isBuffer(packet.payload) ? packet.payload.toString() : packet.payload;
        this.qos = packet.qos;
        this.retain = packet.retain;
    }
}

util.inherits(Request, EventEmitter);