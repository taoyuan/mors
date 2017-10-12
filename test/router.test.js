"use strict";

const mors = require('../');
const mocks = require('./mocks');
const s = require('./support');
const t = s.t;

describe("router", function () {

	describe("handle subscribe request", function () {

		it('should work', function (done) {
			const d = s.donner(2, done);
			const router = new mors.Router();

			router.subscribe('$foo', function (req, res, next) {
				t.equal(req.topic, '$foo');
				next();

				d();
			});
			router.publish('$foo', function (req, res, next) {
				t.fail();
			});

			subscribe(router, '$foo', function (err) {
				t.notOk(err);
				d();
			});
		});

	});

	describe("handle publish request", function () {

		it("should be route()able", function (done) {
			const d = s.donner(2, done);
			const router = new mors.Router();

			router.publish('$foo', function (req, res, next) {
				t.equal(req.topic, '$foo');
				next();

				d();
			});

			publish(router, '$foo', function (err) {
				t.notOk(err);
				d();
			});

		});

		it('should be .use()able', function (done) {
			const d = s.donner(3, done);
			const router = new mors.Router();

			router.use(function (req, res, next) {
				req.foo = 'hello';
				next();
				d();
			});

			router.publish('$foo', function (req, res, next) {
				t.equal(req.foo, 'hello');
				next();
				d();
			});

			publish(router, '$foo', function (err) {
				t.notOk(err);
				d();
			});
		});

		it('should sequence', function (done) {
			const router = new mors.Router();
			let i = 0;

			router.use(function (req, res, next) {
				t.equal(i++, 0);
				next();
			});

			router.publish('$foo/bar', function (req, res, next) {
				t.equal(i++, 1);
				next();
			});

			router.use(function (req, res, next) {
				t.equal(i++, 2);
				next();
			});

			publish(router, '$foo/bar', function (err) {
				t.notOk(err);
				done();
			});
		});

		it('should parse and pass params to handler', function (done) {
			const router = new mors.Router();

			router.publish('$foo/:id/bar/*', function (req, res) {
				t.equal(req.params.id, '123');
				t.equal(req.topic, '$foo/123/bar/baz');
				req.next();
			});

			publish(router, '$foo/123/bar/baz', function (err) {
				t.notOk(err);
				done();
			});
		});

		it("should handle all '*' topic", function (done) {
			const router = new mors.Router();

			router.publish('*', function (req) {
				t.equal('$foo/123/bar/baz', req.topic);
				req.next();
			});
			publish(router, '$foo/123/bar/baz', function (err) {
				t.notOk(err);
				done();
			});
		});

		it('should route multi callback', function (done) {
			const router = new mors.Router();
			let flag = false;
			router.publish('*', function (req) {
				t.equal('$foo', req.topic);
				req.next();
			}, function (req) {
				flag = true;
				req.next();
			});
			publish(router, '$foo', function (err) {
				t.notOk(err);
				t.ok(flag);
				done();
			});
		});
	});

});

function subscribe(router, topic, cb) {
	const client = mocks.client();
	router.handle(mors.Request.subscribe(client, topic), mors.Response(client), cb);
}

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
	const client = mocks.client();
	router.handle(mors.Request.publish(client, s.buildPacket(topic, message, opts)), mors.Response(client), cb);
}
