"use strict";

var mocks = require('./mocks');
var s = require('./support');
var t = s.t;
var mors = require('../');
var Response = mors.Response;

function response() {
    var res = new Response(mocks.client());
    res.expect = function (packet) {
        t.deepEqual(res._packet, packet);
    };
    return res;
}

describe('response', function () {

    it('#publish', function () {
        response().expect({});
        response().topic('/foo').expect({topic: '/foo'});
        response().topic('/foo').publish().expect({topic: '/foo', payload: ''});
        response().topic('/foo').publish('hello').expect({topic: '/foo', payload: 'hello'});
    });

});