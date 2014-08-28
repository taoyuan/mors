"use strict";

var mors = require('../');
var mosca = require('mosca');
var path = require('path');
var s = require('./support');
var t = s.t;

var moscaSettings = function() {
    return {
        port: s.nextPort(),
        stats: false,
        publishNewClient: false,
        persistence: {
            factory: mosca.persistence.Memory
        },
        logger: {
            childOf: s.globalLogger,
            level: 60
        }
    };
};

describe('app', function () {

    describe('listen', function () {
        it("should listen work", function (done) {
            var app = mors();
            app.listen(moscaSettings(), function (err, server) {
                server.close(done);
            });

        });
    });

    describe('req/res', function () {
        beforeEach(s.setup());
        afterEach(s.teardown());

        it("should route work when client publish", function (done) {
            var d = s.donner(2, done);
            var app = this.app;
            app.use(function (req, res, next) {
                t.equal(req.res, res);
                t.equal(res.req, req);
                t.equal(req.next, next);
                t.equal(req.app, app);

                t.ok(req.client);
                t.equal(req.topic, '$foo');
                t.equal(req.payload, 'hello');

                t.ok(res.client);
                t.ok(res.server);
                d();
            });

            s.buildClient(d, this.server, function (client) {
                client.publish('$foo', 'hello');
                client.end();
            });
        });
    });

    describe('pubsub', function () {

        beforeEach(s.setup());

        afterEach(s.teardown());

        it("should route work when client publish", function (done) {
            var d = s.donner(2, done);

            var message = {"data": "hello"};

            this.app.publish('$foo/:fooId/bar/:barId', function (req, res) {
                var params = req.params;
                t.equal(params.fooId, 123);
                t.equal(params.barId, 456);
                t.deepEqual(JSON.parse(req.payload), message);
                d();
            });

            s.buildClient(d, this.server, function (client) {
                client.publish('$foo/123/bar/456', JSON.stringify(message));
                client.end();
            });
        });

        it("should support server and client two-way pub/sub ", function (done) {
            var d = s.donner(2, done);

            this.app.publish('$foo/:id/bar', function (req, res) {
                var id = req.params.id;
                res.topic(path.join(req.topic, 'reply')).publish('ok' + id);
                d();
            });

            s.buildClient(d, this.server, function (client) {
                client.subscribe('$foo/123/bar/reply');
                client.on('message', function (topic, message) {
                    t.equal(message, 'ok123');
                    client.end();
                });

                client.publish('$foo/123/bar', 'hello');
            });
        });
    });

});