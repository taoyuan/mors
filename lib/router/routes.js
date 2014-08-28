"use strict";

var debug = require('debug')('mors:router:route');
var router = require('routes');
var match = router.match;
var methods = require('../methods');
var Layer = require('./layer');
var flatten = require('../utils').flatten;

var slice = Array.prototype.slice;

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
            var matched = match(this.routes, pathname, startAt);
            if (matched) {
                var route = this.routes[matched.next - 1];
                matched.method = route.method;
                matched.layer = route.layer;
                matched.next = this.match.bind(this, pathname, matched.next)
            }
            return matched;
        }
    }
};

function Route(routes, path) {
    this.routes = routes;
    var route = router.Route(escapePath(path));
    for (var key in route) {
        this[key] = route[key];
    }
}

Route.prototype._configure = function (method) {
    var self = this;
    var offset = 1;
    if (typeof method === 'function') {
        method = undefined;
        offset = 0;
    }
    this.method = method;

    var fns = flatten(slice.call(arguments, offset));
    fns.forEach(function (fn) {
        if (typeof fn !== 'function') {
            var type = {}.toString.call(fn);
            var msg = 'Route.' + (method || 'all') + '() requires callback functions but got a ' + type;
            throw new TypeError(msg);
        }

        debug('%s %s', method, self.src);

        self.layer = new Layer(fn);
        self.routes.push(self);
    });
};

Route.prototype.all = function () {
    this._configure.apply(this, [undefined].concat(slice.call(arguments)));
};

methods.forEach(function (method) {
    Route.prototype[method] = function () {
        this._configure.apply(this, [method].concat(slice.call(arguments)));
    }
});