Mors
====

Express inspired "Client-Server" framework using mqtt protocol for [node](nodejs.org).

#Installation
```
npm install mors
```

#Usage

```javascript
var mors = require('mors');

var app = mors();

// Ask the router to attach objects or manipulate `this` object on which the
// function passed to the router will get applied
app.use(function () {
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