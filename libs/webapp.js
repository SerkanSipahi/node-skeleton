
(function(){

    'use strict';

    /*
     * Ziel der Applikation: Singepage, Socket.io
     *
     * Informationen
     * **********************
     *
     * 1.) http://stackoverflow.com/questions/5823722/how-to-serve-an-image-using-nodejs
     * 2.) Documentation: configuration over convention -> http://de.wikipedia.org/wiki/Konvention_vor_Konfiguration
     * 3.) http://blog.invatechs.com/simple_static_file_server_with_caching_on_node_js_part_2 interessanter ansatz für
     *     statische files!
     *
     * Todoes
     * **********************
     *
     * libs/view und libs/webroot nach tests/libs/view und libs/webroot auslagern!
     * */

    var self     = {},
        http     = require('http'),
        fs       = require('fs'),

        url      = require('url'),
        mime     = require('mime'),
        qs       = require('query-string'),
        path     = require('path'),

        _        = require('lodash'),
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

        // > custom request object
        this.request = {
            object      : {}, // > hier requestobject ablegen
            all         : {},
            get         : {},
            post        : {},
            put         : {},
            delete      : {},
            method      : '',
            data        : []  // > hier requestdatas ablegen
        };

        this.response = {
            header      : ''
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

            publicPath : __dirname+'/webroot',
            viewPath   : __dirname+'/view',
            imgPath    : __dirname+'/img',
            jsPath     : __dirname+'/js'
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
        render : function(view){

            var _view    = view || this.view,
                options  = this.options,
                path     = options.viewPath+'/'+_view+options.extension,
                template = fs.readFileSync(path, {encoding : 'utf8'});

            this.response.write(
                this.templateEngines[options.engine](template, this.tempateVars[this.view] || {})
            );

        },
        requestHandler : function(req, res){

            //app use hier aufrufen !;

            var tmpUrl          = url.parse(req.headers.host+req.url, true).pathname.slice(1).split('/'); // > url = require('url'), hiermit behandeln ! sicherer, ausgereifter

            this.response       = res;
            this.request.url    = tmpUrl.join('/');
            // > später mit this.request.url ersetzen!
            this.request.test_url = url.parse(req.headers.host+req.url, true); // > this.getPreparedUrlObject(req);
            this.request.method = req.method.toLowerCase();
            this.request.data   = {};
            this.view           = tmpUrl[0];
            this.body           = '';

            console.log('xxx', this.request.test_url);

            var fname = path.basename(url.parse(req.url, true).pathname);
            var ext = path.extname(fname);
            var dname = path.dirname(req.url);

            console.log('xFoox', fname, ext, dname);

            var requestMethod   = this.request.method,
                requestView     = tmpUrl[0];

            res.writeHead(200, {'Content-Type': this.options.contentType});

            // > prepare post / get datas
            req.on('data', function(body){
                this.body += body;
            }.bind(this));

            req.on('end', function(){

                // > unten request.data auf null setzen, sonst kann ein anderer user
                // > auf diese zugreifen!
                // > info: überral im project schauen ob solche stellen existieren
                this.request.data  = qs.parse(this.body);
                console.log('requestData', this.request.data);

                var internalMethod = this.request[req.method.toLowerCase()],
                    internalView   = this.request[req.method.toLowerCase()][tmpUrl[0]];

                if(internalMethod !== undefined && internalView !== undefined){ // is internalMethod() -> wegen testen
                    this.request[requestMethod][requestView].apply(this, tmpUrl.slice(1));
                    res.end('');
                } else {
                    var filePath = this.options.publicPath+'/'+this.request.url; // > this.request.url.pathname
                    fs.stat(filePath, function (err, stat) {
                        if(!err){
                            var file = fs.readFileSync(filePath);
                            res.statusCode = 200;
                            res.contentType = mime.lookup(filePath);
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