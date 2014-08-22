"use strict";

var mors = require('../../');

var util = require('util');
var PacketBuilder = require('./packet').Builder;
var Client = require('./client');

exports = module.exports = function (app) {
    return new Test(app);
};

function Test(app) {
    if (!(this instanceof Test)) return new Test(app);
    Request.call(this);

    this.app = app;
    this.client = new Client;
}

Test.prototype.__proto__ = Request.prototype;

Test.prototype.publish = function (packet, cb) {
    if (typeof packet === 'function') {
        cb = packet;
        packet = null;
    }
    packet = packet || this.packet;

    var app = this.app;
    var client = this.client;

    var handle = typeof app === 'function' ? app : app.handle.bind(app);
    handle(mors.Request(client, packet), mors.Response(client), cb);
};

/**
 * Request
 *
 * @constructor
 */

function Request() {
    PacketBuilder.call(this);
}

Request.prototype.__proto__ = PacketBuilder.prototype;

