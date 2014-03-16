"use strict";

module.exports = function (/*app*/) {
    return function () {
        var self = this;
        self.publish = function (topic, message, callback) {
            var lastArg = arguments[arguments.length - 1];
            if (typeof lastArg == 'function') {
                callback = lastArg;
            }

            var packet;
            if (typeof topic == 'object') {
                packet = topic;
            } else {
                packet = {
                    topic: topic,
                    payload: message
                }
            }
            self.server.publish(packet, self.client, callback);
        }
    }
};