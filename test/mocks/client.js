"use strict";

const Server = require('./server');

class Client {
	static create() {
		return new Client();
	}

	constructor() {
		this.server = Server.create();
	}
}

module.exports = Client;
