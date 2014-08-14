
// > wenn zu viel post/get data dann abbrechen!

// > je nach datei endung content-type setzen
/*
 var map = {
 '.ico': 'image/x-icon',
 '.html': 'text/html',
 '.js': 'text/javascript',
 '.json': 'application/json',
 '.css': 'text/css',
 '.png': 'image/png'
 };
 */

(function(){

    'use strict';

    var self     = {},
        http     = require('http'),
        fs       = require('fs'),
        qs       = require('query-string'),

        _        = require('underscore'),
        jade     = require('jade'),
        mocha    = require('mocha'),

        toString = {}.toString,
        slice    = [].slice,

        extend = function(target, source, deep){

            for (var key in source){
                if (deep && (isObject(source[key]))) {
                    if (isObject(source[key]) && !isObject(target[key])){
                        target[key] = {};
                    }
                    extend(target[key], source[key], deep);
                }
                else if (source[key] !== undefined) { target[key] = source[key];}
            }
            return target;

        },
        isObject = function(o){
            return toString.call(o) === '[object Object]';
        },
        isString = function(o){
            return toString.call(o) === '[object String]';
        },
        isRegex = function(o){
            return toString.call(o) === '[object Regex]';
        };

    function Webapp(options){

        self = this;

        this.http = http.Server().listen(options ? options.port : 1502 , 'localhost');

        this.body = '';
        this.response = {};
        this.tempateVars = {};

        // > real node request object
        this._request = {};
        // > custom request object
        this.request = {
            all : {},
            get : {},
            post : {},
            put : {},
            delete : {}
        };

        this.templateEngines = {
            underscore : _.template,
            jade       : jade,
            mocha      : mocha
        };

        this.defaults = {
            contentType : 'text/html',
            engine : 'underscore',
            extension : '.ejs',
            viewPath : 'libs/view/'
        };

        this.options = extend(this.defaults, options || {}, true);

        this.init();

    }

    Webapp.prototype = {

        get : function(url, callback){
            this.request.get[url] = callback; return this;
        },
        post : function(url, callback){
            this.request.post[url] = callback; return this;
        },
        put : function(url, callback){
            this.request.put[url] = callback; return this;
        },
        del : function(url, callback){
            this.request.del[url] = callback; return this;
        },
        all : function(url, callback){
            this.request.all[url] = callback; return this;
        },
        on : function(method, url, callback){
            this.request[method][url] = callback; return this;
        },

        set : function(vars){
            this.tempateVars[this.view] = vars;
        },
        render : function(view){
            var view = view || this.view,
                options = this.options,
                path = options.viewPath+this.view+options.extension ,
                template = fs.readFileSync(path, {encoding : 'utf8'});

            this.response.write(
                this.templateEngines[options.engine](template, this.tempateVars[this.view])
            );

        },

        init : function(){
            this.startRequestHandler();
        },
        startRequestHandler : function(){

            this.http.on('request', function(req, res){

                var tmpUrl = req.url.slice(1).split('/');

                this._request       = req;
                this.response       = res;
                this.request.url    = tmpUrl.join('/');
                this.request.method = req.method.toLowerCase();
                this.request.data   = {};
                this.view           = tmpUrl[0];
                this.body           = '';

                var requestMethod   = this.request.method,
                    requestView     = tmpUrl[0];

                res.writeHead(200, {'Content-Type': this.options.contentType});
                req.on('data', function(data){ this.body += data; }.bind(this));
                req.on('end', function(){

                    this.request.data = qs.parse(this.body);

                    var internalMethod = this.request[req.method.toLowerCase()],
                        internalView   = this.request[req.method.toLowerCase()][tmpUrl[0]];

                    if(internalMethod !== undefined && internalView !== undefined){
                        this.request[requestMethod][requestView].apply(this, tmpUrl.slice(1));
                        res.end('');
                    } else {
                        res.writeHead(404, {'Content-Type': this.contentType});
                        res.end('Error');
                    }

                }.bind(this));

            }.bind(this));
        }
    };

    module.exports = function(options){
        return new Webapp(options);
    };

}());
