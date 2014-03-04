"use strict";

var Client = require('mosca/lib/client');

if (!Client.prototype.__mors__) {

//    Client.prototype._handleAuthorizePublish = Client.prototype.handleAuthorizePublish;

    Client.prototype.handleAuthorizePublish = function (err, success, packet) {
        var self = this;

        if (err || !success) {
            this.close();
            return;
        }

        this.server.emit('data', self, packet);
    };

    Client.prototype.__mors__ = true;
}

