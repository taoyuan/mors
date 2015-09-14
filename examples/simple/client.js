"use strict";

var mqtt = require('mqtt');
var client = mqtt.connect({
    host: 'localhost',
    port: 9191
});

client.publish('/hello/me', 'hello_me', {qos: 1}, function () {
    console.log("publish done with qos=1")
});
client.publish('/hello/you', 'hello_you');
client.publish('/some/ty/you', 'some_ty_you');

setTimeout(client.end.bind(client), 1000);