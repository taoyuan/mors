"use strict";

const mors = require('..');
const s = require('./support');
const t = s.t;

describe('server', function () {

	describe('#ready', function () {

		it('should callback invoked immediately if was ready', function (done) {
			let i = 0;
			const server = new mors.Server(mors(), s.nextPort(), function () {
				server.ready(function () {
					t.equal(i, 0);
					server.close(done);
				});
				i++;
			});
		});

		it('should callback invoked when ready', function (done) {
			const server = new mors.Server(mors(), s.nextPort());
			let i = 0;
			server.ready(function () {
				t.equal(i, 1);
				server.close(done);
			});
			i++;
		});
	});
});
