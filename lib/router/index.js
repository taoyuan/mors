"use strict";

var debug = require('debug')('mors:router');
var Routes = require('./routes');
var methods = require('../methods');
var utils = require('../utils');

var slice = Array.prototype.slice;

var proto = module.exports = function () {
    function router(req, res, next) {
        return router.handle(req, res, next);
    }

    // mixin Router class functions
    router.__proto__ = proto;

    router.routes = new Routes();

    return router;
};

/**
 *
 * @param req
 * @param res
 * @param done
 * @returns {boolean}
 */
proto.handle = function (req, res, done) {
    var self = this;

    debug('dispatching %s', req.topic);

    var match = {
        next: function () { return self.routes.match(req.topic); }
    };

    done = done || function (err) {
        if (err) throw err;
    };

    req.next = next;

    next();

    function next(err) {
        var layerError = err === 'route' ? null : err;
        if (!match || !(match = match.next())) return done(layerError);
        var layer = match.layer;

        if (match.method) {
            var method = req.method;
            if (!method || method.toLowerCase() !== match.method) return next();
        }

        req.route = routeFromMatch(match);
        req.params = match.params;
        req.splats = match.splats;

        debug('%s %s : %s', layer.name, match.route, req.topic);

        if (layerError) {
            layer.handle_error(layerError, req, res, next);
        } else {
            layer.handle_request(req, res, next);
        }
    }

};

proto.use = function (fn) {
    var offset = 0;
    var path = '*';

    // default path to '*'
    if (typeof fn !== 'function') {
        offset = 1;
        path = fn;
    }

    var callbacks = utils.flatten(slice.call(arguments, offset));

    if (callbacks.length === 0) {
        throw new TypeError('Router.use() requires callback function');
    }

    var routes = this.routes;
    callbacks.forEach(function (fn) {
        if (typeof fn !== 'function') {
            var type = toString.call(fn);
            var msg = 'Router.use() requires callback function but got a ' + type;
            throw new TypeError(msg);
        }

        // add the middleware
        debug('use %s %s', path, fn.name || '<anonymous>');

        var route = routes.addRoute(path);
        route.all(fn);
    });

    return this;
};

/**
 *
 * @param {String} path
 */
proto.route = function (path) {
    return this.routes.addRoute(path);
};

methods.concat('all').forEach(function (method) {
    proto[method] = function (path) {
        var route = this.routes.addRoute(path);
        route[method].apply(route, slice.call(arguments, 1));
        return this;
    }
});

function routeFromMatch(match) {
    return {
        params: match.params,
        splats: match.splats,
        path: match.route
    }
}
