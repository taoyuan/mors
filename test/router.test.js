"use strict";

var mors = require('../');
var mocks = require('./mocks');
var s = require('./support');
var t = s.t;

describe("router", function () {

    describe("#handle", function () {

        it("should be route()able", function (done) {
            var d = s.donner(2, done);
            var router = new mors.Router();

            router.route('/foo', function (req, res, next) {
                t.equal(req.topic, '/foo');
                next();

                d();
            });

            publish(router, '/foo', function (err) {
                t.notOk(err);
                d();
            });

        });

        it('should be .use()able', function (done) {
            var d = s.donner(3, done);
            var router = new mors.Router();

            router.use(function (req, res, next) {
                req.foo = 'hello';
                next();
                d();
            });

            router.route('/foo', function (req, res, next) {
                t.equal(req.foo, 'hello');
                next();
                d();
            });

            publish(router, '/foo', function (err) {
                t.notOk(err);
                d();
            });
        });

        it('should sequence', function (done) {
            var router = new mors.Router();
            var i = 0;

            router.use(function (req, res, next) {
                t.equal(i++, 0);
                next();
            });

            router.route('/foo/bar', function (req, res, next) {
                t.equal(i++, 1);
                next();
            });

            router.use(function (req, res, next) {
                t.equal(i++, 2);
                next();
            });

            publish(router, '/foo/bar', function (err) {
                t.notOk(err);
                done();
            });
        });

        it('should parse and pass params to handler', function (done) {
            var router = new mors.Router();

            router.route('/foo/:id/bar/*', function (req, res) {
                t.equal(req.params.id, '123');
                t.equal(req.topic, '/foo/123/bar/baz');
                req.next();
            });

            publish(router, '/foo/123/bar/baz', function (err) {
                t.notOk(err);
                done();
            });
        });

        it("should handle all '*' topic", function (done) {
            var router = new mors.Router();

            router.route('*', function (req) {
                t.equal('/foo/123/bar/baz', req.topic);
                req.next();
            });
            publish(router, '/foo/123/bar/baz', function (err) {
                t.notOk(err);
                done();
            });
        });
    });

});

function publish(router, topic, message, opts, cb) {
    if (typeof opts === 'function') {
        cb = opts;
        opts = null;
    } else if (typeof message === 'object') {
        cb = opts;
        opts = message;
        message = undefined;
    } else if (typeof message === 'function') {
        cb = message;
        opts = undefined;
        message = undefined;
    }
    message = message || '';
    var client = mocks.client();
    router.handle(mors.Request(client, s.buildPacket(topic, message, opts)), mors.Response(client), cb);
}