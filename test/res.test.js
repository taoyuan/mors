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

describe('response', function () {

    it('#publish', function (done) {
        var d = s.donner(3, done);
        testPublish([], {});
        testPublish([d], {});
        testPublish(['hello'], {payload: 'hello'});
        testPublish(['hello', d], {payload: 'hello'});
        testPublish(['/foo', 'hello'], {topic: '/foo', payload: 'hello'});
        testPublish(['/foo', 'hello', d], {topic: '/foo', payload: 'hello'});
    })
});