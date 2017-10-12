"use strict";

const EventEmitter = require('events').EventEmitter;

const mosca = require('mosca');
const mixin = require('./utils').merge;
const proto = require('./application');

/**
 * Expose `createApplication()`.
 */

exports = module.exports = createApplication;

/**
 * Create an express application.
 *
 * @return {Function}
 * @api public
 */

function createApplication() {
	const app = function (req, res, next) {
		app.handle(req, res, next);
	};

	app.__proto__ = proto;
	mixin(app, EventEmitter.prototype);

	app.init();
	return app;
}

// expose mosca's exports
exports.Authorizer = mosca.Authorizer;
exports.persistence = mosca.persistence;
exports.Stats = mosca.Stats;

exports.Server = require('./server');
exports.Router = require('./router');
exports.Request = require('./request');
exports.Response = require('./response');
exports.methods = require('./methods');
