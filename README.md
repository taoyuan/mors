Mors
====
[![NPM Version](https://img.shields.io/npm/v/mors.svg?style=flat)](https://www.npmjs.org/package/mors)
[![Build Status](http://img.shields.io/travis/taoyuan/mors.svg?style=flat)](https://travis-ci.org/taoyuan/mors)
[![Dependencies](https://img.shields.io/david/taoyuan/mors.svg?style=flat)](https://david-dm.org/taoyuan/mors)

> Express inspired mqtt development framework based on [mosca](https://github.com/mcollina/mosca) for [node](nodejs.org).

```js
var mors = require('mors')
var app = mors()

app.route('*', function (req, res) {
  console.log('received', req.topic, req.payload);
});

app.listen(9191)
```

## Installation
```shell
$ npm install mors
```

## Features

* Full features from [mosca](https://github.com/mcollina/mosca)
* Express style usage
* Usable inside ANY other node.js app
* Supports node v0.10 ~ 0.12

## Application
### settings
The following settings will alter how Express behaves:

* __env__ Environment mode, defaults to `process.env.NODE_ENV`(NODE_ENV environment variable) or "development"

### app.set(name, value)
Assigns setting `name` to `value`.

### app.get(name)
Get setting `name` value.

### app.enable(name)
Set setting `name` to `true`.

### app.disable(name)
Set setting `name` to `false`.

### app.enabled(name)
Check if setting `name` is enabled.

### app.disabled(name)
Check if setting `name` is disabled.

### app.use([path], function)
Use the given middleware `function` (with optional mount path, defaulting to "*").

```js
var mors = require('mors');
var app= mors();

// simple logger
app.use(function(req, res, next){
  console.log('PUB %s', req.topic);
  next();
});

// respond
app.use(function(req, res, next){
  res.publish(req.topic + '$reply', 'Hello World');
});

app.listen(9191);
```

### app.VERB(path, [callback...], callback)
The app.VERB() methods provide the routing functionality in Express, where VERB is one of the PUB/SUB verbs 
(such as app.post()). Multiple callbacks may be given; all are treated equally, and behave just like middleware.

### app.all(path, [callback...], callback)
This method functions just like the app.VERB() methods, however it matches all PUB/SUB verbs.

### app.route(path)
Returns an instance of a single route, which can then be used to handle PUB/SUB verbs with optional middleware. 
Using app.route() is a recommended approach for avoiding duplicate route names (and thus typo errors).

```js
var app = mors();

app.route('/events')
.all(function(req, res, next) {
  // runs for all PUB/SUB verbs first
  // think of it as route specific middleware!
})
.subscribe(function(req, res, next) {
  // on subscribe
})
.publish(function(req, res, next) {
  // maybe add a new event...
})
```

### app.authorizer
Set `authorizer` for authenticating and authorizing the clients. The `authorizer` include three methods:

* authenticate(client, username, password, callback)
* authorizePublish(client, topic, payload, callback)
* authorizeSubscribe(client, topic, callback)

More information: [Authentication & Authorization](https://github.com/mcollina/mosca/wiki/Authentication-&-Authorization)

### app.listen()
Bind and listen for mutt clients on the given host and port. This method is identical to `mors.Server()` witch inherits from `mosca.Server`.

```js
var mors = require('mors');
var app = mors();
app.listen(9191);
```

## Request
### req.params
This property is an object containing properties mapped to the named route "parameters". For example, if you have the route `/user/:name`, then the "name" property is available to you as `req.params.name`. This object defaults to {}.

```js
// ROUTE "/user/:name" with TOPIC "/user/ty"
req.params.name
// => "ty"
```

More information: [routes.js](http://github.com/aaronblohowiak/routes.js)

### req.route
The currently matched Route containing several properties (such as the route's path string, the params, and so on).

```js
app.get('$user/:id?', function(req, res){
  console.log(req.route);
});
```

Example output from the previous snippet:

```js
{
	params: {
		id: '1'
	},
	splats: [],
	path: '$user/:id'
}
```

### req.topic
The `topic` of the request packet.

### req.payload
The `payload` of the request packet.

### req.qos
The `qos` of the request packet.

### req.retain
The `retain` of the request packet.

## Response
### res.topic
Set response `topic`.

### res.payload
Set response `payload`

### res.qos
Set response `qos`

### res.retain
Set response `retain`

### res.publish([message], [callback])
Publish a response with the message.

```js
res.topic('$foo/bar').publish('hello');
res.topic('$foo/bar').publish('hello', cb);
```

## Router
### router.use([path], function)
Use the given middleware `function`, with optional mount `path`, defaulting to "*".

Middleware is like a plumbing pipe, requests start at the first middleware you define and work their way "down" the middleware stack processing for each path they match.

### router.route(path, callback)
Currently this is treated equally, and behave just like use.

## Middleware
* [mors-payload](https://github.com/taoyuan/mors-payload) A mors payload parsing middleware

## Links

* [Mosca](http://github.com/mcollina/mosca)
* [Mosca Documentation](http://mcollina.github.io/mosca/docs)
* [Routes.js](http://github.com/aaronblohowiak/routes.js)
* [MQTT protocol](http://mqtt.org)
* [MQTT.js](http://github.com/adamvr/MQTT.js)

# License

MIT