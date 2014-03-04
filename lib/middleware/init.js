"use strict";

module.exports = function (app) {
    return function () {
        this.server = app.server;
    }
};