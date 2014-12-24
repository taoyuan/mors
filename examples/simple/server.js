"use strict";

var mors = require('../../');

var app = mors();

// use middleware to attach `foo` to req
app.use(function (req, res, next) {
    req.foo = 'hello';
    next();
});

// route to mesasge for '/hello/me'
app.all('/hello/me', function(req, res, next){
    console.log(req.foo); // will output 'hello'
    console.log('received', req.topic, req.payload);
    console.log('----------------------------------');
});

// route to mesasge for '/hello/you'
app.all('/hello/you', function(req, res, next){
    console.log('received', req.topic, req.payload);
    console.log('----------------------------------');
});

// route to mesasge for '/some/:person/you' with a named param for that token
app.all('/some/:person/you', function(req, res, next){
    console.log(req.params.person);
    console.log('received', req.topic, req.payload);
    console.log('----------------------------------');
});

// listen on 9191
app.listen(9191, function (err, server) {
    console.log('Mors/Mosca server tarted on ' + server.opts.port);
    console.log('================================');
});