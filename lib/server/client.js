"use strict";

const Client = module.exports = require('mosca/lib/client');

const origHandleAuthorizePublish = Client.prototype.handleAuthorizePublish;

if (origHandleAuthorizePublish.__owner__) return;

function handleAuthorizePublish(err, success, packet) {
	const that = this;
	if (!that.server.handlePublish) {
		return origHandleAuthorizePublish.call(that, err, success, packet);
	}

	if (err || !success) {
		if (!this._closed && !this._closing) {
			that.close();
		}
		return;
	}

	if (success instanceof Buffer) {
		packet.payload = success;
	}

	return this.server.handlePublish(this, packet, function () {
		if (packet.qos === 1 && !(that._closed || that._closing)) {
			that.connection.puback({
				messageId: packet.messageId
			});
		}
	});
}

handleAuthorizePublish.__owner__ = 'mors';

Client.prototype.handleAuthorizePublish = handleAuthorizePublish;
