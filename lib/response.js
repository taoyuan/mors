"use strict";

const debug = require('debug')('mors:response');
const EventEmitter = require('events').EventEmitter;
const utils = require('./utils');

class Response extends EventEmitter {

	static create() {
		return new Response(...arguments);
	}

	constructor(client) {
		super();

		this.client = client;
		this.server = client.server;
		this._packet = {};
	}

	topic(topic) {
		this._packet.topic = topic;
		return this;
	};

	payload(payload) {
		this._packet.payload = payload;
		return this;
	};

	qos(qos) {
		this._packet.qos = qos;
		return this;
	};

	retain(retain) {
		this._packet.retain = retain;
		return this;
	};

	_publish(packet, callback) {
		return this.server.publish(packet, this.client, callback);
	};

	publish(message, callback) {
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

	json(obj, callback) {
		return this.publish(JSON.stringify(obj), callback);
	};

	_finish() {
		this.emit('finish');
	};

	end() {
		if (this.finished) return;
		this.finished = true;
		this._finish();
	};

}

module.exports = Response;
