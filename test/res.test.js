"use strict";

const mocks = require('./mocks');
const s = require('./support');
const t = s.t;
const mors = require('..');
const Response = mors.Response;

function response() {
	const res = new Response(mocks.Client.create());
	res.expect = function (packet) {
		t.deepEqual(res._packet, packet);
	};
	return res;
}

describe('response', function () {

	it('#publish', function () {
		response().expect({});
		response().topic('/foo').expect({topic: '/foo'});
		response().topic('/foo').publish().expect({topic: '/foo', payload: ''});
		response().topic('/foo').publish('hello').expect({topic: '/foo', payload: 'hello'});

		const message = {message: "hello"};
		response().topic('/foo').json(message).expect({topic: '/foo', payload: JSON.stringify(message)});
		response().topic('/foo').publish(message).expect({topic: '/foo', payload: JSON.stringify(message)});
	});

});
