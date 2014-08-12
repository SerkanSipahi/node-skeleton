
(function(){

	'use strict';

	var http      = require('http'),
		fs        = require('fs'),
		_         = require('underscore'),
		self      = {};

	function Webserver(options){

		self = this;

		this.http = {};
		this.response = {};
		this.currentUrl = null;
		this.tempateVars = {};
		this.templateEngine = _.template;
		this.templateExtension = '.ejs';
		this.contentType = options['Content-Type'] || 'text/html';
		// > wie bei cakephp
		this.request = {};
		this.requests = { get : {}, post : {} };

		this._init();

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
			this.http = http.createServer().listen(1502);
		},
		_initDispatcher : function(){
			this.http.on('request', function(req, res){

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

	var webserver = new Webserver({
		'Content-Type' : 'text/html'
	});

	///////////////////////////////////

	webserver
		.get('/index', function(){
			this.set({
				header : 'im header of index',
				footer : 'im footer of index'
			});
			this.render();
		})
		.get('/add', function(){
			this.set({
				header : 'im header of add',
				footer : 'im footer of add'
			});
			this.render();
		})
		.get('/edit', function(){
			this.set({
				header : 'im header of edit',
				footer : 'im footer of edit'
			});
			this.render();
		})
		.get('/delete', function(){
			this.set({
				header : 'im header of delete',
				footer : 'im footer of delete'
			});
			this.render();
		});

}());
