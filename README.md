Mors
====
  [![NPM Version](https://img.shields.io/npm/v/mors.svg?style=flat)](https://www.npmjs.org/package/mors)
  [![Build Status](http://img.shields.io/travis/taoyuan/mors.svg?style=flat)](https://travis-ci.org/taoyuan/mors)

> Express inspired "Client-Server" framework based on [mosca](https://github.com/mcollina/mosca) for [node](nodejs.org).

```js
var mors = require('mors')
var app = mors()

app.route('/', function (req, res) {
  console.log('received', req.topic, req.payload);
});

app.listen(9191)
```

## Installation
```shell
$ npm install mors
```

## Features

* Full features from [Mosca](https://github.com/mcollina/mosca)
* Express style usage
* Usable inside ANY other node.js app
* Supports node v0.10

## Request
_(Coming soon)_

## Response
_(Coming soon)_

## Router
_(Coming soon)_

## Middleware
_(Coming soon)_

## RPC
_(Coming soon)_

## Links

* [Mosca](http://github.com/mcollina/mosca)
* [Mosca Documentation](http://mcollina.github.io/mosca/docs)
* [Routes.js](http://github.com/aaronblohowiak/routes.js)
* [MQTT protocol](http://mqtt.org)
* [MQTT.js](http://github.com/adamvr/MQTT.js)

# License

MIT