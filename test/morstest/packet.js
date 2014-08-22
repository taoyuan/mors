"use strict";

exports.Builder = PacketBuilder;

function PacketBuilder() {
    this.packet = {};
}

PacketBuilder.prototype.packet = function (packet) {
    this.packet = packet;
    return this;
};

PacketBuilder.prototype.topic = function (topic) {
    this.packet.topic = topic;
    return this;
};

PacketBuilder.prototype.payload = function (payload) {
    this.packet.payload = payload;
    return this;
};

PacketBuilder.prototype.qos = function (qos) {
    this.packet.qos = qos;
    return this;
};

PacketBuilder.prototype.retain = function (retain) {
    this.packet.retain = retain;
    return this;
};