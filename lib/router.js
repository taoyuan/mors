"use strict";

var director = require('director');
var util = require('util');

//
// ### function Router (routes)
// #### @routes {Object} **Optional** Routing table for this instance.
// Constuctor function for the HTTP Router object responsible for building
// and dispatching from a given routing table.
//
var Router = module.exports = function (routes) {
    if (!(this instanceof Router)) {
        return new Router(routes);
    }

    director.Router.call(this, routes);
    //
    // ### Extend the `Router` prototype with all of the RFC methods.
    //
    this.routes   = {};
    this.recurse = 'forward';
    this.stack = [];

    this.configure();
    this.mount(routes || {});
};

//
// Inherit from `director.Router`.
//
util.inherits(Router, director.Router);

/**
 *
 * @param {String} path
 * @param {Function|?} route
 */
Router.prototype.on = Router.prototype.route = function (path, route) {
    director.Router.prototype.on.call(this, 'on', path, route);
};

//
// ### function use (func)
// ### @func {function} Function to execute on `this` before applying to router function
// Ask the router to attach objects or manipulate `this` object on which the
// function passed to the http router will get applied
Router.prototype.use = function (func) {
    this.stack.push(func);
};

/**
 *
 * @param client
 * @param packet
 * @param callback
 * @returns {boolean}
 */
Router.prototype.dispatch = function (client, packet, callback) {
    var method = 'on',
        thisArg = { client: client, packet: packet },
        error,
        fns,
        topic;

    try { topic = decodeURI(packet.topic) }
    catch (ex) { topic = null }

    if (topic) {
        fns = this.traverse(method, topic, this.routes, '');
    }

    if (this.stack) {
        for (var i in this.stack) {
            this.stack[i].call(thisArg);
        }
    }

    if (!fns || fns.length === 0) {
        error = new Error('Could not find subscription: ' + packet.topic);
        if (typeof this.notfound === 'function') {
            this.notfound.call(thisArg, callback);
        }
        else if (callback) {
            callback.call(thisArg, error, client, packet);
        }
        return false;
    }

    if (this.recurse === 'forward') {
        fns = fns.reverse();
    }

    this.invoke(this.runlist(fns), thisArg, callback);

    return true;
};
