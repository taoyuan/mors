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
app.attach(function () {
	this.foo = 'hello';
});

// route to mesasge for '/hello/me'
mors.route('/hello/me', function(){
	console.log(this.foo); // will output 'hello'
	console.log('received', this.packet.topic, this.packet.payload);
});

// route to mesasge for '/hello/you'
mors.route('/hello/you', function(){
	console.log('received', this.packet.topic, this.packet.payload);
});

// route to mesasge for '/some/:person/you' with a named param for that token
mors.route('/some/:person/you', function(person){
	console.log('received', this.packet.topic, this.packet.payload);
});

// linsten on 1883
app.listen(1883);
```

# API Documentation

* [Constructor](#constructor)
* [Internal Properties of `this`](#internal-properties-of-this)
* [Attach Properties to `this`](#attach-to-this)

<a name="constructor"/>
## Constructor
```js
var app = Mors();
```

<a name="internal-properties-of-this"/>
## Internal Properties of `this`
* `server` The mosca server.
* `client` The client object in mosca.
* `packet` The packet published from client.
* `publish` The publish function used to publish messages from route handler with 4 arguments: (topic, message, opts, callback). For example:

with `opts`:

```js
app.route('*', function () {
	this.publish("hello/there/world", "a message", {
		qos: 0, // 0, 1, or 2
  		retain: false // or true
  	});
});
```

or without `opts`:

```js
app.route('*', function () {
	this.publish("hello/there/world", "a message");
});
```

or just broadcast the packet received:

```js
app.route('*', function () {
	this.publish(this.packet);
});
```

<a name="attach-to-this"/>
## Attach Properties to `this`

Generally, the `this` object bound to route handlers, will contain the client in `this.client` and the server in `this.server`. One may attach additional properties to `this` with the `app.attach` method:

```js
  var Mors = require('mors');

  var app = mors();

  // Attach properties to `this`
  app.attach(function () {
    this.greeting = 'hello';
  });


  // Access properties attached to `this` in your routes!
  app.get('/presence', function () {
  
    // The mesage to send will be 'hello xxx' if the message received is 'xxx'
    this.publish('/presence', this.greeting + ' ' + this.packet.payload);
  });
```

This API may be used to attach convenience methods to the `this` context of route handlers.

# More Information

* [mosca](http://github.com/mcollina/mosca) The multi-transport MQTT broker for node.js. It supports AMQP, Redis, MongoDB, ZeroMQ or just MQTT.
* [director](http://github.com/flatiron/director) A tiny and isomorphic URL router for JavaScript.

# License

MIT