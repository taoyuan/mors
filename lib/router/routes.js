"use strict";

const debug = require('debug')('mors:router:route');
const router = require('routes');
const match = router.match;
const methods = require('../methods');
const Layer = require('./layer');
const flatten = require('../utils').flatten;

const slice = Array.prototype.slice;

function escapePath(path) {
	return path.replace(/\$/, "\\$");
}

module.exports = function () {
	//using 'new' is optional
	return {
		routes: [],
		routeMap: {},
		addRoute: function (path) {
			return new Route(this.routes, path);
		},

		match: function (pathname, startAt) {
			const matched = match(this.routes, pathname, startAt);
			if (matched) {
				const route = this.routes[matched.next - 1];
				matched.method = route.method;
				matched.layer = route.layer;
				matched.next = this.match.bind(this, pathname, matched.next)
			}
			return matched;
		}
	}
};

class Route {
	constructor(routes, path) {
		this.routes = routes;
		const route = router.Route(escapePath(path));
		for (const key in route) {
			this[key] = route[key];
		}
	}


	_configure(method) {
		const self = this;
		let offset = 1;
		if (typeof method === 'function') {
			method = undefined;
			offset = 0;
		}
		this.method = method;

		const fns = flatten(slice.call(arguments, offset));
		fns.forEach(function (fn) {
			if (typeof fn !== 'function') {
				const type = {}.toString.call(fn);
				const msg = 'Route.' + (method || 'all') + '() requires callback functions but got a ' + type;
				throw new TypeError(msg);
			}

			debug('%s %s', method, self.src);

			self.layer = new Layer(fn);
			self.routes.push(self);
		});
	}

	all() {
		this._configure.apply(this, [undefined].concat(slice.call(arguments)));
	}
}

methods.forEach(function (method) {
	Route.prototype[method] = function () {
		this._configure.apply(this, [method].concat(slice.call(arguments)));
	}
});
