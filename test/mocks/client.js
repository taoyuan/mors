"use strict";

var server = require('./server');

module.exports = function () {
    return {
        server: server()
    }
};