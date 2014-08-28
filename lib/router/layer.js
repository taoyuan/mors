"use strict";

var debug = require('debug')('mors:router:layer');

module.exports = Layer;

function Layer(fn) {
    if (!(this instanceof Layer)) return new Layer(fn);

    this.handle = fn;
    this.name = fn.name || '<anonymous>';
}

/**
 * Handle the error for the layer.
 *
 * @param {Error} error
 * @param {Request} req
 * @param {Response} res
 * @param {function} next
 * @api private
 */

Layer.prototype.handle_error = function handle_error(error, req, res, next) {
    var fn = this.handle;

    if (fn.length !== 4) {
        // not a standard error handler
        return next(error);
    }

    try {
        fn(error, req, res, next);
    } catch (err) {
        next(err);
    }
};

/**
 * Handle the request for the layer.
 *
 * @param {Request} req
 * @param {Response} res
 * @param {function} next
 * @api private
 */

Layer.prototype.handle_request = function handle(req, res, next) {
    var fn = this.handle;

    if (fn.length > 3) {
        // not a standard request handler
        return next();
    }

    try {
        fn(req, res, next);
    } catch (err) {
        next(err);
    }
};