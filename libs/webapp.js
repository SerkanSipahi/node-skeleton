
(function(){

    'use strict';

    var http      = require('http'),
        fs        = require('fs'),
        _         = require('underscore'),
        qs        = require('query-string'),
        self      = {};


    function Request(){

    }

    Request.prototype = {
        init : function(){

        }
    };

    function Webapp(){

        self = this;

        this.http = {};
        this.response = {};
        this.currentUrl = null;
        this.tempateVars = {};
        this.templateEngine = _.template;
        this.templateExtension = '.ejs';
        this.contentType = 'text/html';
        // > wie bei cakephp
        this.request = {};
        this.requests = { get : {}, post : {} };

        this._init();

    }

    Webapp.prototype = {
        // > public
        get : function(url, callback){
            this.requests.get[url] = callback; return this;
        },
        post : function(url, callback){
            this.requests.post[url] = callback; return this;
        },
        render : function(template){
            var template = fs.readFileSync((this.currentUrl+this.templateExtension).slice(1), {
                    encoding : 'utf8'
                }),
                compiled = this.templateEngine(template, this.tempateVars[this.currentUrl]);
            this.response.write(compiled);
        },
        set : function(vars){
            this.tempateVars[this.currentUrl] = vars;
        },
        // > private
        _init : function(){
            this._initServer();
            this._initDispatcher();
        },
        _initServer : function(){
            this.http = http.createServer().listen(1502, 'localhost');
        },
        _initDispatcher : function(){
            this.http.on('data', function(data){
                console.log(data);
            });
            this.http.on('request', function(req, res){

                // > wenn zu viel post/get data dann abbrechen!

                // > je nach datei endung content-type setzen
                var map = {
                    '.ico': 'image/x-icon',
                    '.html': 'text/html',
                    '.js': 'text/javascript',
                    '.json': 'application/json',
                    '.css': 'text/css',
                    '.png': 'image/png'
                };

                var body = '';

                req.on('data', function(data){
                    console.log('y', data);
                    body += data;
                });
                req.on('end', function(){
                    console.log('x', qs.parse(body));
                });

                var method = this.requests[req.method.toLowerCase()],
                    url    = this.requests[req.method.toLowerCase()][req.url];

                this.currentUrl = req.url;
                this.response   = res;

                res.writeHead(200, {'Content-Type': this.contentType});

                if(method!==void(0) && url!==void(0)){
                    this.requests[req.method.toLowerCase()][req.url].call(this, res);
                    res.end('');
                } else {
                    res.end('Error');
                }

            }.bind(this));
        }
    };

    module.exports = new Webapp();

}());
