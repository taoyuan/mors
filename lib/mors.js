"use strict";

var EventEmitter = require('events').EventEmitter;

var mosca = require('mosca');
var mixin = require('./utils').merge;
var proto = require('./application');
var mqtts = require('./mqtts');

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
    var app = function(req, res, next) {
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
exports.Request = mqtts.Request;
exports.Response = mqtts.Response;



