"use strict";

var mors = require('../');
var request = require('./morstest');
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

            request(router)
                .topic('/foo')
                .publish(function (err) {
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

            request(router)
                .topic('/foo')
                .publish(function (err) {
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

            request(router)
                .topic('/foo/bar')
                .publish(function (err) {
                    t.notOk(err);
                    done();
                });
        });

        it('should parse and pass params to handler', function(done) {
            var router = new mors.Router();

            router.route('/foo/:id/bar/*', function(req, res) {
                t.equal(req.params.id, '123');
                t.equal(req.topic, '/foo/123/bar/baz');
                req.next();
            });

            request(router)
                .topic('/foo/123/bar/baz' )
                .publish(function (err) {
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
            request(router)
                .topic('/foo/123/bar/baz' )
                .publish(function (err) {
                    t.notOk(err);
                    done();
                });
        });
    });

});