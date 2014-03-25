"use strict";

var mors = require('../');
var s = require('./support');
var t = s.t;
var helpers = require('./helpers');
var handlers = helpers.handlers;

describe.only("mors/router", function () {

    describe("#dispatch", function () {

        it("should dispatch", function (done) {
            var router = new mors.Router();

            router.route('/foo', function (c) {
                c.client.send('foo');
            });

            var client = {
                send: function(val) {
                    t.equal(val, 'foo');
                    done();
                }
            };

            router.dispatch(client, {topic: '/foo'});
        });

        it('should be .attach()able', function (done){
            var router = new mors.Router();

            router.attach(function (c) {
                c.foo = 'hello';
            });

            router.route('/foo', function (c) {
                t.equal(c.foo, 'hello');
                done();
            });

            router.dispatch({}, {topic: '/foo'});

        });

        it('should parse and pass params to handler', function(done) {
            var router = new mors.Router();

            router.route('/foo/:id/bar/*', function(c) {
                t.equal(c.params.id, '123');
                t.equal(c.topic, '/foo/123/bar/baz');
                done();
            });

            router.dispatch({}, { topic: '/foo/123/bar/baz' });
        });

        it("should handle all '*' topic", function (done) {
            var router = new mors.Router();

            router.route('*', function (c) {
                t.equal('/foo', c.topic);
                done();
            });
            router.dispatch({}, {topic: '/foo'});
        });
    });

});