"use strict";

var mocks = require('./mocks');
var s = require('./support');
var t = s.t;
var mors = require('../');
var Response = mors.Response;

function testPublish(args, expected) {
    var res = new Response(mocks.client());
    res.publish.apply(res, args);
    t.deepEqual(res._packet, expected);
}

function response() {
    var res = new Response(mocks.client());
    res.expect = function (packet) {
        res.end();
        t.deepEqual(res._packet, packet);
    };
    return res;
}

describe('response', function () {

    it('#end', function () {
        response().expect({});
        response().topic('/foo').expect({topic: '/foo'});
        response().topic('/foo').payload('hello').expect({topic: '/foo', payload: 'hello'});
    });

    it('#publish', function () {
        testPublish([], {});
        testPublish(['/foo'], {topic: '/foo'});
        testPublish(['/foo', 'hello'], {topic: '/foo', payload: 'hello'});
    });


});