"use strict";

const debug = require('debug')('mors');

const flatten = require('./utils').flatten;
const Router = require('./router');
const Server = require('./server');
const methods = require('./methods');

const slice = Array.prototype.slice;

/**
 * Application prototype.
 */

const app = exports = module.exports = {};

/**
 * Initialize the server.
 *
 *   - setup default configuration
 *   - setup default middleware
 *   - setup route reflection methods
 *
 * @api private
 */

app.init = function () {
	this.settings = {};
	this.defaultConfiguration();
};

/**
 * Initialize application configuration.
 *
 * @api private
 */

app.defaultConfiguration = function () {
	// default settings
	const env = process.env.NODE_ENV || 'development';
	this.set('env', env);
};

/**
 * lazily adds the base router if it has not yet been added.
 *
 * We cannot add the base router in the defaultConfiguration becaattach
 * it reads app settings which might be set after that has run.
 *
 * @api private
 */
app.lazyrouter = function () {
	if (!this._router) {
		this._router = new Router();

		this._router.use(require('./middleware/init')(this));
	}
};

app.handle = function (req, res, done) {
	this.lazyrouter();
	this._router.handle(req, res, function (err) {
		// TODO make a better way to deal with errors while no done provided
		if (err && !done) {
			console.error(err);
			return;
		}
		done && done(err);
	});
};

app.get = function (setting) {
	return this.set(setting);
};

/**
 * Assign `setting` to `val`, or return `setting`'s value.
 *
 *    app.get('foo', 'bar');
 *    app.get('foo');
 *    // => "bar"
 *
 * Mounted servers inherit their parent server's settings.
 *
 * @param {String} setting
 * @param {*} [val]
 * @return {Server|*} for chaining
 * @api public
 */

app.set = function (setting, val) {
	if (1 == arguments.length) {
		return this.settings[setting];
	} else {
		this.settings[setting] = val;
		return this;
	}
};

/**
 * Check if `setting` is enabled (truthy).
 *
 *    app.enabled('foo')
 *    // => false
 *
 *    app.enable('foo')
 *    app.enabled('foo')
 *    // => true
 *
 * @param {String} setting
 * @return {Boolean}
 * @api public
 */

app.enabled = function (setting) {
	return !!this.get(setting);
};

/**
 * Check if `setting` is disabled.
 *
 *    app.disabled('foo')
 *    // => true
 *
 *    app.enable('foo')
 *    app.disabled('foo')
 *    // => false
 *
 * @param {String} setting
 * @return {Boolean}
 * @api public
 */

app.disabled = function (setting) {
	return !this.get(setting);
};

/**
 * Enable `setting`.
 *
 * @param {String} setting
 * @return {app} for chaining
 * @api public
 */

app.enable = function (setting) {
	return this.set(setting, true);
};

/**
 * Disable `setting`.
 *
 * @param {String} setting
 * @return {app} for chaining
 * @api public
 */

app.disable = function (setting) {
	return this.set(setting, false);
};

/**
 * Proxy `Router#attach()` to add middleware to the app router.
 * See Router#attach() documentation for details.
 *
 * If the _fn_ parameter is an express app, then it will be
 * mounted at the _route_ specified.
 *
 * @param {Function|Server} fn
 * @return {app} for chaining
 * @api public
 */

app.use = function (fn) {
	let offset = 0;
	let path = '*';

	// default path to '*'
	if (typeof fn !== 'function') {
		offset = 1;
		path = fn;
	}

	const fns = flatten(slice.call(arguments, offset));

	if (fns.length === 0) {
		throw new TypeError('app.use() requires middleware functions');
	}

	// setup router
	this.lazyrouter();
	const router = this._router;

	fns.forEach(function (fn) {
		// non-express app
		if (!fn || !fn.handle || !fn.set) {
			return router.use(path, fn);
		}

		debug('.use app under %s', path);
		console.warn('Unsupported')
	});

	return this;
};

/**
 * Proxy to the app `Router#route()`
 *
 * Routes are isolated middleware stacks for specific paths.
 * See the Route api docs for details.
 *
 * @api public
 */

app.route = function (path) {
	this.lazyrouter();
	return this._router.route(path);
};


methods.forEach(function (method) {
	app[method] = function (path) {
		this.lazyrouter();

		const route = this._router.route(path);
		route[method].apply(route, slice.call(arguments, 1));
		return this;
	};
});

app.all = function (path) {
	this.lazyrouter();

	const route = this._router.route(path);
	const args = slice.call(arguments, 1);
	methods.forEach(function (method) {
		route[method].apply(route, args);
	});

	return this;
};

app.authorizer = function (authorizer) {
	if (arguments.length === 0) return this._authorizer;
	this._authorizer = authorizer;
	return this;
};


/**
 * The function that will be used to authenticate users.
 * This default implementation authenticate everybody.
 * Override at will.
 *
 * @api public
 * @param {Object} client The MQTTConnection that is a client
 * @param {String} username The username
 * @param {String} password The password
 * @param {Function} callback The callback to return the verdict
 */

app.__defineGetter__('authenticate', function () {
	const self = this;
	return function (client, username, password, callback) {
		if (self._authorizer && self._authorizer.authenticate) {
			return self._authorizer.authenticate(client, username, password, callback);
		}
		callback(null, true);
	}
});

/**
 * The function that will be used to authorize clients to publish to topics.
 * This default implementation authorize everybody.
 * Override at will
 *
 * @api public
 * @param {Object} client The MQTTConnection that is a client
 * @param {String} topic The topic
 * @param {String} payload The payload
 * @param {Function} callback The callback to return the verdict
 */
app.__defineGetter__('authorizePublish', function () {
	const self = this;
	return function (client, topic, payload, callback) {
		if (self._authorizer && self._authorizer.authorizePublish) {
			return self._authorizer.authorizePublish(client, topic, payload, callback);
		}
		callback(null, true);
	}
});

/**
 * The function that will be used to authorize clients to subscribe to topics.
 * This default implementation authorize everybody.
 * Override at will
 *
 * @api public
 * @param {Object} client The MQTTConnection that is a client
 * @param {String} topic The topic
 * @param {Function} callback The callback to return the verdict
 */
app.__defineGetter__('authorizeSubscribe', function () {
	const self = this;
	return function (client, topic, callback) {
		if (self._authorizer && self._authorizer.authorizeSubscribe) {
			return self._authorizer.authorizeSubscribe(client, topic, callback);
		}
		callback(null, true);
	}
});

app.listen = function (opts, callback) {
	return new Server(this, opts, callback);
};
