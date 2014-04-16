"use strict";

var mosca = require('mosca');

var middleware = require('./middleware');
var Router = require('./router');

/**
 * Application prototype.
 */

var app = exports = module.exports = {};

function toNumber(x) { return (x = Number(x)) >= 0 ? x : false; }

/**
 * Initialize the server.
 *
 *   - setup default configuration
 *   - setup default middleware
 *   - setup route reflection methods
 *
 * @api private
 */

app.init = function () {
    this.settings = {};
    this.defaultConfiguration();
};

/**
 * Initialize application configuration.
 *
 * @api private
 */

app.defaultConfiguration = function () {
    // default settings
    var env = process.env.NODE_ENV || 'development';
    this.set('env', env);
};

/**
 * lazily adds the base router if it has not yet been added.
 *
 * We cannot add the base router in the defaultConfiguration becaattach
 * it reads app settings which might be set after that has run.
 *
 * @api private
 */
app.lazyrouter = function () {
    if (!this._router) {
        this._router = new Router();

        this._router.attach(middleware.init(this));
        this._router.attach(middleware.publish(this));
    }
};

app.handle = function (client, packet) {

    this._router.dispatch(client, packet, function (err) {
        err && console.error(err);
    });
};

app.get = function (setting) {
    return this.settings[setting];
};

/**
 * Assign `setting` to `val`, or return `setting`'s value.
 *
 *    app.get('foo', 'bar');
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

app.set = function (setting, val) {
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

app.enabled = function (setting) {
    return !!this.get(setting);
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

app.disabled = function (setting) {
    return !this.get(setting);
};

/**
 * Enable `setting`.
 *
 * @param {String} setting
 * @return {app} for chaining
 * @api public
 */

app.enable = function (setting) {
    return this.set(setting, true);
};

/**
 * Disable `setting`.
 *
 * @param {String} setting
 * @return {app} for chaining
 * @api public
 */

app.disable = function (setting) {
    return this.set(setting, false);
};


/**
 * Configure callback for zero or more envs,
 * when no `env` is specified that callback will
 * be invoked for all environments. Any combination
 * can be used multiple times, in any order desired.
 *
 * Examples:
 *
 *    app.configure(function(){
 *      // executed for all envs
 *    });
 *
 *    app.configure('stage', function(){
 *      // executed staging env
 *    });
 *
 *    app.configure('stage', 'production', function(){
 *      // executed for stage and production
 *    });
 *
 * Note:
 *
 *  These callbacks are invoked immediately, and
 *  are effectively sugar for the following:
 *
 *     var env = process.env.NODE_ENV || 'development';
 *
 *      switch (env) {
 *        case 'development':
 *          ...
 *          break;
 *        case 'stage':
 *          ...
 *          break;
 *        case 'production':
 *          ...
 *          break;
 *      }
 *
 * @param {String} env...
 * @param {Function} fn
 * @return {app} for chaining
 * @api public
 */

app.configure = function(env, fn){
    var envs = 'all'
        , args = [].slice.call(arguments);
    fn = args.pop();
    if (args.length) envs = args;
    if ('all' == envs || ~envs.indexOf(this.settings.env)) fn.call(this);
    return this;
};

/**
 * Proxy `Router#attach()` to add middleware to the app router.
 * See Router#attach() documentation for details.
 *
 * If the _fn_ parameter is an express app, then it will be
 * mounted at the _route_ specified.
 *
 * @param {Function|Server} fn
 * @return {app} for chaining
 * @api public
 */

app.attach = function (fn) {
    this.lazyrouter();
    this._router.attach(fn);

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

app.route = function (path, fn) {
    this.lazyrouter();
    this._router.route(path, fn);

    return this;
};

app.listen = function (opts, callback) {
    var self = this;

    if (typeof opts == 'function') {
        callback = opts;
        opts = {}
    } else if (typeof opts == 'number') {
        opts = { port: toNumber(opts) };
    }
    opts = opts || {};

    return mosca.Server(opts, function (err, server) {
        self.setup(server);
        callback && callback(null, server);
    });
};

app.setup = function (server) {
    var self = this;

    server.handleClientPublish = function (client, packet) {
        return self.handle(client, packet);
    };

    var authorizer = this.get('authorizer');
    if (authorizer) {
        server.authenticate = authorizer.authenticate;
        server.authorizeSubscribe = authorizer.authorizeSubscribe || server.authorizeSubscribe;
        server.authorizePublish = authorizer.authorizePublish || authorizer.authorizePublish;
    }

    server.authenticate = this.get('authenticate') || server.authenticate;
    server.authorizeSubscribe = this.get('authorizeSubscribe') || server.authorizeSubscribe;
    server.authorizePublish = this.get('authorizePublish') || server.authorizePublish;

};

