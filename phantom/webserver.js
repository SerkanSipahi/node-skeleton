
(function(){

    'use strict';

    var http      = require('http'),
        self      = {};

    function Webserver(options){

        self = this;

        this.http = {};
        this.response = {};
        this.currentUrl = null;
        this.tempateVars = {};
        this.contentType = options['Content-Type'] || 'text/html';
        this.requests = { get : {}, post : {} };

        this._initServer();
        this._initDispatcher();

    }
    
    Webserver.prototype = {
        // > public
        get : function(url, callback){
            this.requests.get[url] = callback; return this;
        },
        post : function(url, callback){
            this.requests.post[url] = callback; return this;
        },
        render : function(template){

        },
        set : function(){

        },
        // > private
        _initServer : function(){
            this.http = http.createServer().listen(1502);
        },
        _initDispatcher : function(){
            this.http.on('request', function(req, res){

                res.writeHead(200, {'Content-Type': this.contentType});
                var method = this.requests[req.method.toLowerCase()],
                    url    = this.requests[req.method.toLowerCase()][req.url];

                this.currentUrl = url;
                this.response   = res;

                if(method!==void(0) && url!==void(0)){
                    this.requests[req.method.toLowerCase()][req.url].call(this, res);
                    res.end('');
                } else {
                    res.end('Error');
                }
            }.bind(this));
        }
    };

    ///////////////////////////////////

    var webserver = new Webserver({
        'Content-Type' : 'text/html'
    });

    ///////////////////////////////////

    webserver
        .get('/', function(res){
            res.write('im /');
            this.set({ a : 'foo', b : 'bar'});
            this.render();
        })
        .get('/add', function(res){
            res.write('im add');
        })
        .get('/edit', function(res){
            res.write('im edit');
        })
        .get('/delete', function(res){
            res.write('im delete');
        });

}());

