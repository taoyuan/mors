"use strict";

module.exports = function () {
    return {
        publish: function (topic, payload, opts, callback) {
            if (typeof opts === 'function') {
                callback = opts;
                opts = null;
            }
            callback && callback();
        }
    }
};