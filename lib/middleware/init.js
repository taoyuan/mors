"use strict";

module.exports = function (/*app*/) {
    return function () {
        this.server = this.client.server;
    }
};