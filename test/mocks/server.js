"use strict";

const util = require('util');
const EventEmitter = require('events').EventEmitter;

module.exports = function () {
	return new Server();
};

function Server() {
	EventEmitter.call(this);
}

util.inherits(Server, EventEmitter);

Server.prototype.publish = function (topic, payload, opts, callback) {
	if (typeof opts === 'function') {
		callback = opts;
		opts = null;
	}
	this.emit('published');
	callback && callback();
};
