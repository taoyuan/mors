"use strict";

var mors = require('../');
var s = require('./support');
var t = s.t;

describe('server', function () {

    describe('#ready', function () {

        it('should callback invoked immediately if was ready', function (done) {
            var i = 0;
            var server = new mors.Server(mors(), s.nextPort(), function () {
                server.ready(function () {
                    t.equal(i, 0);
                    server.close(done);
                });
                i++;
            });
        });

        it('should callback invoked when ready', function (done) {
            var server = new mors.Server(mors(), s.nextPort());
            var i = 0;
            server.ready(function () {
                t.equal(i, 1);
                server.close(done);
            });
            i++;
        });
    });
});