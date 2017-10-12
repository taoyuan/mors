"use strict";

module.exports = function (app) {
	return function init_middleware(req, res, next) {
		req.res = res;
		res.req = req;
		req.next = next;

		req.app = res.app = app;

		res.qos(req.qos || 0);
		res.retain(req.retain || false);
		next();
	}
};
