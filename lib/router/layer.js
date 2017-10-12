"use strict";

class Layer {
	constructor(fn) {
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

	handle_error(error, req, res, next) {
		const fn = this.handle;

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

	handle_request(req, res, next) {
		const fn = this.handle;

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

}

module.exports = Layer;
