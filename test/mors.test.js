"use strict";

var mors = require('../')
    , h = require('./helpers')
    , s = require('./support')
    , t = s.t;

describe('mors', function () {

    var app;
    var server;
    var settings;

    beforeEach(function (done) {
        app = mors();
        settings = s.buildSettings();
        server = app.listen(settings, done);
    });

    afterEach(function (done) {
        server.close(done);
    });

    it("should emit ready event on listen successful", function (done) {
        var newSettings = s.buildSettings();

        newSettings.backend = {
            type: "mqtt",
            json: false,
            port: settings.port,
            keepalive: 3000,
            host: "127.0.0.1",
            mqtt: require("mqtt")
        };

        var app = mors();
        app.listen(newSettings, function (err, server) {
            server.close(done);
        });
    });

    it("should route when client publish", function (done) {
        var d = s.plan(2, done);

        app.route('/foo/:id/bar', function (id) {
            t.equal(id, 123);
            t.ok(this.server);
            t.ok(this.client);
            t.ok(this.packet);
            t.equal(this.packet.payload, 'hello');
            d();
        });

        s.buildClient(settings.port, settings.host, function (client) {
            client.once('error', d);
            client.once('close', d);

            client.publish('/foo/123/bar', 'hello');
            client.end();
        });
    });

    it("should publish ack to client", function (done) {
        var d = s.plan(2, done);

        app.route('/foo/:id/bar', h.handlers.handleWithId);

        s.buildClient(settings.port, settings.host, function (client) {
            client.once('error', d);
            client.once('close', d);

            client.subscribe('/foo/123/bar/ack');
            client.on('message', function (topic, message) {
                t.equal(message, h.messages.messageWithId(123));
                client.end();
                d();
            });

            client.publish('/foo/123/bar', 'hello');

        });
    });

});