"use strict";

var mosca = require('mosca');
var needs = require('needs');
var middleware = needs(__dirname + '/middleware');

var Router = require('./router');

/**
 * Application prototype.
 */

var app = exports = module.exports = {};


/**
 * Initialize the server.
 *
 *   - setup default configuration
 *   - setup default middleware
 *   - setup route reflection methods
 *
 * @api private
 */

app.init = function(){
    this.settings = {};
    this.defaultConfiguration();
};

/**
 * Initialize application configuration.
 *
 * @api private
 */

app.defaultConfiguration = function(){
    // default settings
    var env = process.env.NODE_ENV || 'development';
    this.set('env', env);
};

/**
 * lazily adds the base router if it has not yet been added.
 *
 * We cannot add the base router in the defaultConfiguration because
 * it reads app settings which might be set after that has run.
 *
 * @api private
 */
app.lazyrouter = function() {
    if (!this._router) {
        this._router = new Router();

        this._router.use(middleware.init(this));
//        this._router.use(middleware.init(this));
    }
};

app.handle = function (client, packet) {

    this._router.dispatch(client, packet, function (err) {
        err && console.error(err);
    });
};

/**
 * Assign `setting` to `val`, or return `setting`'s value.
 *
 *    app.set('foo', 'bar');
 *    app.get('foo');
 *    // => "bar"
 *
 * Mounted servers inherit their parent server's settings.
 *
 * @param {String} setting
 * @param {*} [val]
 * @return {Server|*} for chaining
 * @api public
 */

app.set = function(setting, val){
    if (1 == arguments.length) {
        return this.settings[setting];
    } else {
        this.settings[setting] = val;
        return this;
    }
};

/**
 * Check if `setting` is enabled (truthy).
 *
 *    app.enabled('foo')
 *    // => false
 *
 *    app.enable('foo')
 *    app.enabled('foo')
 *    // => true
 *
 * @param {String} setting
 * @return {Boolean}
 * @api public
 */

app.enabled = function(setting){
    return !!this.set(setting);
};

/**
 * Check if `setting` is disabled.
 *
 *    app.disabled('foo')
 *    // => true
 *
 *    app.enable('foo')
 *    app.disabled('foo')
 *    // => false
 *
 * @param {String} setting
 * @return {Boolean}
 * @api public
 */

app.disabled = function(setting){
    return !this.set(setting);
};

/**
 * Enable `setting`.
 *
 * @param {String} setting
 * @return {app} for chaining
 * @api public
 */

app.enable = function(setting){
    return this.set(setting, true);
};

/**
 * Disable `setting`.
 *
 * @param {String} setting
 * @return {app} for chaining
 * @api public
 */

app.disable = function(setting){
    return this.set(setting, false);
};


/**
 * Proxy `Router#use()` to add middleware to the app router.
 * See Router#use() documentation for details.
 *
 * If the _fn_ parameter is an express app, then it will be
 * mounted at the _route_ specified.
 *
 * @param {String|Function|Server} route
 * @param {Function|Server} fn
 * @return {app} for chaining
 * @api public
 */

app.use = function(fn){
    this.lazyrouter();
    this._router.use(fn);

    return this;
};

/**
 * Proxy to the app `Router#route()`
 *
 * Routes are isolated middleware stacks for specific paths.
 * See the Route api docs for details.
 *
 * @api public
 */

app.route = function(path, fn){
    this.lazyrouter();
    this._router.route(path, fn);

    return this;
};

app.listen = function (opts, callback) {
    if (typeof opts === 'function') {
        callback = opts;
        opts = null;
    }
    opts = opts || this.serverOpts;
    this.serverOpts = opts;

    var server = new mosca.Server(opts, callback);
    this._setupServer(server);
    return server;
};

app._setupServer = function (server) {
    var self = this;

    server.on('ready', function () {
        self.emit('ready');
    });

    server.on("closed", function() {
        self.server = null;
        self.emit('closed');
    });

    server.on('data', function (client, packet) {
        self.handle(client, packet);
    });

    var authorizer = this.set('authorizer');
    if (authorizer) {
        server.authenticate = authorizer.authenticate;
        server.authorizeSubscribe = authorizer.authorizeSubscribe;
        server.authorizePublish = authorizer.authorizePublish;
    }

    this.server = server;
};

app.close = function (callback) {
    if (this.server) {
        return this.server.close(callback);
    }
    return callback && callback();
};