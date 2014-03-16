"use strict";

var mors = require('../');
var path = require('path');


exports.handlers = {
    handleWithId: function (id) {
        this.publish(path.join(this.packet.topic, 'ack'), exports.messages.messageWithId(id));
    },
    handleWithData: function () {
//        this.res.writeHead(200, { 'Content-Type': 'application/json' })
//        this.res.end(JSON.stringify(this.data));
    },
    handleWithOk: function () {
//        return function () {
//            this.res.writeHead(200);
//            this.res.end('ok');
//        };
    }
};

exports.messages = {
    messageWithId: function (id) {
        return 'hello from (' + id + ')';
    }
};