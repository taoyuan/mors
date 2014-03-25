"use strict";

var Routes = require('routes');

var Router = module.exports = function () {
    this.stack = [];
    this.routes = Routes();
};

/**
 *
 * @param {String} path
 * @param {Function|?} fn
 */
Router.prototype.route = function (path, fn) {
    this.routes.addRoute(path, fn);
};

//
// ### function attach (func)
// ### @func {function} Function to execute on `this` before applying to router function
// Ask the router to attach objects or manipulate `this` object on which the
// function passed to the http router will get applied
Router.prototype.attach = function (func) {
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
    var context = { client: client, packet: packet },
        error,
        match,
        fn,
        topic;

    try { topic = decodeURI(packet.topic) }
    catch (ex) { topic = null }

    context.topic = topic;
    context.message = Buffer.isBuffer(packet.payload) ? packet.payload.toString() : packet.payload;

    if (this.stack) {
        for (var i in this.stack) {
            this.stack[i].call(context, context);
        }
    }

    if (topic) {
        match = this.routes.match(topic);
        if (match) {
            fn = match.fn;
            context.params = match.params;
        }
    }

//  if (!fns || fns.length === 0) {
    if (!fn) {
        error = new Error('Could not find route: ' + packet.topic);
        if (typeof this.notfound === 'function') {
            this.notfound.call(context, callback);
        }
        else if (callback) {
            callback.call(context, error, client, packet);
        }
        return false;
    }

    fn.call(context, context);

    return true;
};
