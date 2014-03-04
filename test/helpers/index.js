"use strict";

var mors = require('../..');
var path = require('path');


exports.handlers = {
    handleWithId: function (id) {
        this.client.server.publish({
            topic: path.join(this.packet.topic, 'ack'),
            payload: 'hello from (' + id + ')'
        });
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