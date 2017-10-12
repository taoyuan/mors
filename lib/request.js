"use strict";

const util = require('util');
const EventEmitter = require('events').EventEmitter;
const methods = require('./methods');

module.exports = Request;

function Request(client, topicOrPacket) {
	if (!(this instanceof Request)) return new Request(client, topicOrPacket);

	EventEmitter.call(this);

	this.client = client;
	let topic;

	if (typeof topicOrPacket === 'string') {
		topic = topicOrPacket
	} else if (typeof topicOrPacket === 'object') {
		topic = topicOrPacket.topic;
		this.payload = topicOrPacket.payload;
		this.qos = topicOrPacket.qos;
		this.retain = topicOrPacket.retain;
	}

	if (topic) {
		try {
			this.topic = decodeURI(topic)
		}
		catch (ex) {
			this.topic = null
		}
	}
}

util.inherits(Request, EventEmitter);

methods.forEach(function (method) {
	Request[method] = function () {
		const req = Request.apply(null, arguments);
		req.method = method;
		return req;
	}
});
