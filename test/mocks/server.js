"use strict";

const EventEmitter = require('events').EventEmitter;

class Server extends EventEmitter {

	static create() {
		return new Server(...arguments);
	}

	constructor() {
		super();
	}

	publish(topic, payload, opts, callback) {
		if (typeof opts === 'function') {
			callback = opts;
			opts = null;
		}
		this.emit('published');
		callback && callback();
	};
}

module.exports = Server;
