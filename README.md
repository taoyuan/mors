Mors
====

Express inspired "Client-Server" framework using mqtt protocol for [node](nodejs.org).

# Installation
```
npm install mors
```

# Usage

```js
var Mors = require('mors');

var app = Mors();

// Ask the router to attach objects or manipulate `this` object on which the
// function passed to the router will get applied
app.attach(function (c) {
	c.foo = 'hello';
});

// route to mesasge for '/hello/me'
mors.route('/hello/me', function(c){
	console.log(c.foo); // will output 'hello'
	console.log('received', c.topic, c.message);
});

// route to mesasge for '/hello/you'
mors.route('/hello/you', function(c){
	console.log('received', c.topic, c.message);
});

// route to mesasge for '/some/:person/you' with a named param for that token
mors.route('/some/:person/you', function(c){
    console.log(c.params.person);
	console.log('received', c.topic, c.message);
});

// linsten on 1883
app.listen(1883);
```

# API Documentation

* [Constructor](#constructor)
* [Basic Properties of `context`](#basic-properties-of-context)
* [Attach Properties to `context`](#attach-to-context)

<a name="constructor"/>
## Constructor

```js
var app = Mors();
```

<a name="basic-properties-of-context"/>
## Basic Properties of `context`

* `server` The mosca server.
* `client` The client object in mosca.
* `packet` The packet published from client.
* `publish` The publish function used to publish messages from route handler with 4 arguments: (topic, message, opts, callback). For example:

with `opts`:

```js
app.route('*', function (context) {
	context.publish("hello/there/world", "a message", {
		qos: 0, // 0, 1, or 2
  		retain: false // or true
  	});
});
```

or without `opts`:

```js
app.route('*', function (context) {
	context.publish("hello/there/world", "a message");
});
```

or just broadcast the packet received:

```js
app.route('*', function (context) {
	context.publish(context.packet);
});
```

<a name="attach-to-context"/>
## Attach Properties to `context`

Generally, the `context` object passed to route handlers, will contain [basic](#basic-properties-of-context) properties. One may attach additional properties to `context` with the `app.attach` method:

```js
  var Mors = require('mors');

  var app = mors();

  // Attach properties to `context`
  app.attach(function (context) {
    context.greeting = 'hello';
  });

  // Access properties attached to `context` in your routes!
  app.get('/presence', function (context) {
    // The mesage to send will be 'hello xxx' if the message received is 'xxx'
    context.publish('/presence', context.greeting + ' ' + context.packet.payload);
  });
```

This API may be used to attach convenience methods to the `context` of route handlers.

# More Information

* [mosca](http://github.com/mcollina/mosca) The multi-transport MQTT broker for node.js. It supports AMQP, Redis, MongoDB, ZeroMQ or just MQTT.
* [routes](http://github.com/aaronblohowiak/routes.js) a minimalist url-style routing library, extracted from connect.

# License

MIT