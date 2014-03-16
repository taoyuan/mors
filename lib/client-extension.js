"use strict";

var Client = require('mosca/lib/client');

if (!Client.prototype.__mors__) {

    Client.prototype._handleAuthorizePublish = Client.prototype.handleAuthorizePublish;

    Client.prototype.handleAuthorizePublish = function (err, success, packet) {
        if (!this.server.handleClientPublish) {
            return this.server._handleAuthorizePublish(err, success, packet);
        }
        if (err || !success) {
            this.close();
            return null;
        }

        return this.server.handleClientPublish(this, packet);
    };

    Client.prototype.__mors__ = true;
}

