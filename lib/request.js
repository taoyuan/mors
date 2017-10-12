"use strict";

const EventEmitter = require('events').EventEmitter;
const methods = require('./methods');

class Request extends EventEmitter {

	static create() {
		return new Request(...arguments);
	}

	constructor(client, topicOrPacket) {
		super();

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
}

module.exports = Request;

methods.forEach(function (method) {
	Request[method] = function () {
		const req = new Request(...arguments);
		req.method = method;
		return req;
	}
});
