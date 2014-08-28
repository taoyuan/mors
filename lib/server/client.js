"use strict";

var Client = module.exports = require('mosca/lib/client');

var origHandleAuthorizePublish = Client.prototype.handleAuthorizePublish;

if (origHandleAuthorizePublish.__owner__) return;

function handleAuthorizePublish(err, success, packet) {
    if (!this.server.handlePublish) {
        return origHandleAuthorizePublish.call(this, err, success, packet);
    }

    if (err || !success) {
        this.close();
        return;
    }

    if (success instanceof Buffer) {
        packet.payload = success;
    }

    return this.server.handlePublish(this, packet);
}

handleAuthorizePublish.__owner__ = 'mors';

Client.prototype.handleAuthorizePublish = handleAuthorizePublish;
