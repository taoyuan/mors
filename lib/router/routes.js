"use strict";

var Route = require('routes').Route;
var match = require('routes').match;

module.exports = function(){
    //using 'new' is optional
    return {
        routes: [],
        routeMap : {},
        addRoute: function(path, fn){
            if (!path) throw new Error(' route requires a path');
            if (!fn) throw new Error(' route ' + path.toString() + ' requires a callback');

            var route = Route(escapePath(path));
            route.fn = fn;

            this.routes.push(route);
        },

        match: function(pathname, startAt){
            var route = match(this.routes, pathname, startAt);
            if(route){
                route.fn = this.routes[route.next - 1].fn;
                route.next = this.match.bind(this, pathname, route.next)
            }
            return route;
        }
    }
};

function escapePath(path){
    return path.replace(/\$/, "\\$");
}