"use strict";

var mors = require('../');
var Authorizer = require('mosca').Authorizer;
var s = require('./support');
var t = s.t;

describe('auth', function () {

    var authorizer;

    beforeEach(s.setup());
    beforeEach(function () {
        authorizer = new Authorizer;
        this.app.authorizer(authorizer);
    });
    afterEach(s.teardown());

    describe('authenticate', function () {

        it("it should not authenticate an unknown user", function(done) {
            var client = s.buildClient(this.server);
            client.on('error', function (err) {
                t.include(err.message, 'Not authorized');
                done();
            });
        });

        it("it should authenticate a known user", function(done) {
            var test = this;
            authorizer.addUser("user", "pass", function() {
                s.buildClient(done, test.server, {username: 'user', password: 'pass'}, function (client) {
                    client.end();
                });
            });
        });
    });

    describe('authorizePublish', function () {

        var test, app;
        beforeEach(function () {
            test = this;
            app = this.app;
        });

        it("should default the authorizePublish param to **", function(done) {
            var d = s.donner(2, done);
            app.route('/topic', function (req, res) {
                d();
            });

            authorizer.addUser("user", "pass", null, function() {
                s.buildClient(d, test.server, {username: 'user', password: 'pass'}, function (client) {
                    client.publish('/topic', 'payload');
                    client.end();
                });
            });
        });

        it("it should authorize a publish based on a pattern", function(done) {
            var d = s.donner(2, done);
            app.route('/topic/other', function (req, res) {
                d();
            });

            authorizer.addUser("user", "pass", "/topic/*", function() {
                s.buildClient(d, test.server, {username: 'user', password: 'pass'}, function (client) {
                    client.publish('/topic/other', 'payload');
                    client.end();
                });
            });
        });

        it("it should not authorize a publish based on a pattern", function(done) {
            authorizer.addUser("user", "pass", "/topic/this", function() {
                var client = s.buildClient(test.server, {username: 'user', password: 'pass'}, function (client) {
                    client.publish('/topic/other/buu', 'payload');
                });

                // authorized fail, the server will close directly without any reponse
                client.on('close', function (err) {
                    client.end();
                    done();
                });
            });
        });
    });

    describe("authorizeSubscribe", function() {
        var test, app;
        beforeEach(function () {
            test = this;
            app = this.app;
        });

        it("should default the authorizeSubscribe param to **", function(done) {
            authorizer.addUser("user", "pass", null, null, function() {
                s.buildClient(test.server, {username: 'user', password: 'pass'}, function (client) {
                    client.subscribe('other', function (err, granted) {
                        t.notOk(err);
                        t.lengthOf(granted, 1);
                        t.notEqual(granted[0].qos, 128);
                        done();
                    });
                });
            });
        });

        it("it should not authorize a publish based on the topic", function(done) {
            authorizer.addUser("user", "pass", "**", "/topic", function() {
                s.buildClient(test.server, {username: 'user', password: 'pass'}, function (client) {
                    client.subscribe('other', function (err, granted) {
                        t.notOk(err);
                        t.lengthOf(granted, 1);
                        t.equal(granted[0].qos, 128);
                        done();
                    });
                });
            });
        });
    });
});