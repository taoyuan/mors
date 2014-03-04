"use strict";

var EventEmitter = require('events').EventEmitter;
var util = require('util');
var mixin = require('utils-merge');

var proto = require('./application');

// extend mosca Client
require('./client-extension');

exports = module.exports = Mors;

function Mors() {
    if (!(this instanceof Mors)) {
        return new Mors();
    }

    proto.init.call(this);
}

util.inherits(Mors, EventEmitter);
mixin(Mors.prototype, proto);


Mors.Router = require('./router');

