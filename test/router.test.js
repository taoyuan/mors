"use strict";

var mors = require('../');
var s = require('./support');
var t = s.t;
var helpers = require('./helpers');
var handlers = helpers.handlers;

describe("mors/router", function () {
    
    it("should have the correct routes defined", function () {
        var router = new mors.Router({
            '/hello': {
                on: handlers.handleWithId
            }
        });
        t.isObject(router.routes.hello);
        t.isFunction(router.routes.hello.on);
    });
    
    describe("#dispatch", function () {

        it("should dispatch", function (done) {
            var router = new mors.Router();

            router.route('/foo', function () {
                this.client.send('foo');
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

            router.attach(function () {
                this.foo = 'hello';
            });

            router.route('/foo', function () {
                t.equal(this.foo, 'hello');
                done();
            });

            router.dispatch({}, {topic: '/foo'});

        });

        it('should parse and pass params to handler', function(done) {
            var router = new mors.Router();

            router.route('/foo/:id/bar/*', function(id) {
                t.equal(id, '123');
                t.equal(this.packet.topic, '/foo/123/bar/baz');
                done();
            });

            router.dispatch({}, { topic: '/foo/123/bar/baz' });
        });

        it("should handle all '*' topic", function (done) {
            var router = new mors.Router();

            router.route('*', function () {
                t.equal('/foo', this.packet.topic);
                done();
            });
            router.dispatch({}, {topic: '/foo'});
        });
    });

});