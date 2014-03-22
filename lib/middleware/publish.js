"use strict";

var merge = require('utils-merge');

module.exports = function (/*app*/) {
    return function () {
        var self = this;
        self.publish = function (topic, message, opts, callback) {
            var lastArg = arguments[arguments.length - 1];
            if (typeof lastArg === 'function') {
                callback = lastArg;
            }

            var packet;
            if (typeof topic === 'object') {
                packet = topic;
            } else {
                if (typeof opts !== 'object') {
                    opts = {};
                }
                packet = merge({ topic: topic, payload: message }, opts);
            }

            self.server.publish(packet, self.client, callback);
        }
    }
};