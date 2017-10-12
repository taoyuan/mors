"use strict";

const server = require('./server');

module.exports = function () {
	return {
		server: server()
	}
};
