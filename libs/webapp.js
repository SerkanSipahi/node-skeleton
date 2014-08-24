
(function(){

    'use strict';

    var self     = {},
        http     = require('http'),
        fs       = require('fs'),

        url      = require('url'),
        mime     = require('mime'),
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

        this.public     = __dirname+'/webroot';

        // > http://stackoverflow.com/questions/5823722/how-to-serve-an-image-using-nodejs
        // > um sicher zu gehen eventuell alles als binary senden ! siehe stackoverflow

        // > https://github.com/broofa/node-mime -> interessant, volle apache liste ! automatische erkennung
        // > node-mime kann die untere liste ablösen
        this.headers = {
            '\\.ico'    : 'image/x-icon',
            '\\.txt'    : 'text/plain',
            '\\.html'   : 'text/html',
            '\\.js'     : 'text/javascript',
            '\\.json'   : 'application/json',
            '\\.css'    : 'text/css',
            '\\.png'    : 'image/png',
            '\\.gif'    : 'imgae/gif',
            '\\.jpg'    : 'image/jpeg' // > prüfen ob okey(.jpg)
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
        determineContentType : function(url, headers){
            var tmpHeader = headers['\\.txt'];
            Object.keys(headers).forEach(function(extension){
                if(!(new RegExp(extension)).test(url)){ return; }
                tmpHeader = headers[extension];
            });
            return tmpHeader;
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
        requestHandler : function(req, res){

            //app use hier aufrufen !

            var tmpUrl          = req.url.slice(1).split('/'); // > url = require('url'), hiermit behandeln ! sicherer, ausgereifter

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
                } else {
                    var publicPath = this.public+'/'+req.url;
                    fs.stat(publicPath, function (err, stat) {
                        if(!err){
                            var file = fs.readFileSync(publicPath);
                            res.statusCode = 200;
                            // > mime.lookup('/path/to/file.txt');
                            // > mime.lookup('/path/to/file.txt');
                            res.contentType = this.determineContentType(req.url, this.headers);
                            res.contentLength = stat.size;
                            res.end(file, 'binary');
                        } else {
                            res.statusCode = 404;
                            res.contentType = 'text/html';
                            res.end('Error');
                        }
                    }.bind(this));
                }
            }.bind(this));

            return this;

        }
    };

    module.exports = function(options){

        var app = new Webapp(options),
            requestHandler = app.requestHandler.bind(app),
            server = http.createServer(requestHandler);

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
