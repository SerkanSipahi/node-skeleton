
(function(){

    'use strict';

    var self     = {},
        http     = require('http'),
        url      = require('url'),
        fs       = require('fs'),
        qs       = require('query-string'),

        _        = require('underscore'),
        jade     = require('jade'),
        mocha    = require('mocha'),

        toString = {}.toString,
        slice    = [].slice,

        extend = function(target, source, deep){

            Object.keys(source).map(function(_, key){
                if (deep && (isObject(source[key]))) {
                    if (isObject(source[key]) && !isObject(target[key])){
                        target[key] = {};
                    }
                    extend(target[key], source[key], deep);
                } else if (source[key] !== undefined) {
                    target[key] = source[key];
                }
            });

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

        self                  = this;

        this.body             = '';
        this.response         = {};
        this.tempateVars      = {};
        this.uses             = [];

        // > real node request object
        this._request = {};

        // > custom request object
        this.request = {
            all         : {},
            get         : {},
            post        : {},
            put         : {},
            delete      : {}
        };

        // > http://stackoverflow.com/questions/5823722/how-to-serve-an-image-using-nodejs
        // > um sicher zu gehen eventuell alles als binary senden ! siehe stackoverflow

        this.headers = {
            '.ico'      : 'image/x-icon',
            '.html'     : 'text/html',
            '.js'       : 'text/javascript',
            '.json'     : 'application/json',
            '.css'      : 'text/css',
            '.png'      : 'image/png',
            '.gif'      : 'imgae/gif',
            '.jpg'      : 'image/jpg' // > prüfen ob okey(.jpg)
            // > prüfen was es für weitere dateitypen exisitieren
        };

        this.templateEngines = {
            underscore  : _.template,
            jade        : jade,
            mocha       : mocha
        };

        this.defaults = {
            contentType : 'text/html',
            engine      : 'underscore',
            extension   : '.ejs',
            viewPath    : 'libs/view/'
        };

        this.options = extend(this.defaults, options || {}, true);

    }

    Webapp.prototype = {
        use : function(callback){
            this.uses.push(callback);
        },
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
        redirect : function(view){

        },
        set : function(vars){
            this.tempateVars[this.view] = vars || {};
        },
        render : function(view, callback){
            var _view    = view || this.view,
                options  = this.options,
                path     = options.viewPath+_view+options.extension ,
                template = fs.readFileSync(path, {encoding : 'utf8'});

            this.response.write(
                this.templateEngines[options.engine](template, this.tempateVars[this.view] || {})
            );

        },
        requestHandler : function(){

            //app use hier aufrufen !

            var req             = arguments[0],
                res             = arguments[1],
                // > url      = require('url'), hiermit behandeln ! sicherer, ausgereifter
                tmpUrl          = req.url.slice(1).split('/');

            // > _request nach this.nodeRequest
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


            req.on('data', function(body){
                this.body += body;
            }.bind(this));

            req.on('end', function(){

                this.request.data  = qs.parse(this.body);

                var internalMethod = this.request[req.method.toLowerCase()],
                    internalView   = this.request[req.method.toLowerCase()][tmpUrl[0]];

                if(internalMethod !== undefined && internalView !== undefined){
                    this.request[requestMethod][requestView].apply(this, tmpUrl.slice(1));
                    res.end('');
                } else if(this.fileExists(tmpUrl[0])){
                    // suchen ob vielleicht ein bild, json verlang wurde
                } else {
                    res.writeHead(404, {'Content-Type': this.contentType});
                    res.end('Error');
                }

            }.bind(this));

            return this;

        }
    };

    module.exports = function(options){

        // > init http server and webapp
        var app    = new Webapp(options),
            server = http.createServer(
                app.requestHandler.bind(app)
            );

        // > interfaces
        return {
            use    : app.use.bind(app),
            get    : app.get.bind(app),
            post   : app.post.bind(app),
            put    : app.put.bind(app),
            del    : app.del.bind(app),
            all    : app.all.bind(app),
            on     : app.on.bind(app),
            render : app.render.bind(app),
            listen : server.listen.bind(server)
        };

    };

}());
