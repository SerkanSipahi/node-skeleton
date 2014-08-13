#! /usr/bin/env node

/*
 * TODO: skeleton nach menuility umbenennen
 * https://github.com/SerkanSipahi/skeleton
 *
 * Copyright (c) 2014 Serkan Sipahi
 * Licensed under the MIT license.
 */

(function(){

    'use strict';

    var self         = {},
        $            = {},
        which        = require('which'),
        fs           = require('fs-extra'),
        mkdirp       = require('mkdirp'),
        shelljs      = require('shelljs/global'),
        bower        = require('bower'),
        cli_skeleton = require('commander'),
        ncp          = require('ncp').ncp,
        env          = require('jsdom').env,
        path         = require('path'),
        childProcess = require('child_process'),
        phantomjs    = require('phantomjs'),
        webapp       = require('./libs/webapp'),
        phantom      = phantomjs.path,

        // > Helper-Functions
        capitalize = function(value) {
            return value.charAt(0).toUpperCase() + value.slice(1);
        },
        type = function(o){
            return Object.prototype.toString.call(o).slice(8, -1).toLowerCase();
        },
        extend = function(that, override, parent){

            if(type(that)!=='object') { return; }

            for(var item in that){
                if(!that.hasOwnProperty(item)){ continue; }
                if(type(that[item])!=='object'){
                    if(parent!==void(0)){
                        override[parent][item] = that[item];
                    } else {
                        override[item] = that[item];
                    }
                } else {
                    extend(that[item], override, item);
                }
            }
        };

    function NodeSkeleton(object){

        self = this;

        this.name = 'skeleton';
        this.object = object;

        // > settings
        this.watch  = false;
        this.minify = false;

        this.base = '';
        this.path = {
            'webpage'      : 'localhost:1502',
            'skeleton'     : '',
            'tmp'          : '',
            'tmp_skeleton' : '',
            'htmlFile'     : ''
        };

        this.$ = {};

        // > callbacks
        this.ready = false;
        this.onReady = void(0);
        // > ===================
        this.compile = false;
        this.onCompile = void(0);
        // > ===================
        this.render = false;
        this.onRender = void(0);

        this.pattern = /sk-(left|top|bottom|right)-nav(?:.*?)data-sk-align="static:until\((\d+px)\)"/gm;

        this.data = {
            matched   : null,
            skeleton  : null,
            htmlFile  : null,
            untilHash : null
        };

        this.errorMessages = {

        };

        extend(object, this);

        env('-', function (errors, window) {
            this.ready = true;
            this.$ = $ = require('jquery')(window);

            if(this.onReady!==void(0)){
                this.onReady.call(this);
            }

            this.init();

        }.bind(this));

    }
    NodeSkeleton.prototype = {

        init : function(){

            $.when(true)
                .then(self.binExists('bower'))
                .then(self.binExists('sass'))
                .then(self.coreHTMLFileExists())
                .then(self.mkdirp(this.path.tmp))
                .then(function(){
                    return self.readFile(self.path.skeleton)().done(function(data){
                        self.data.skeleton = data;
                    });
                })
                .then(function(){
                    return self.readFile(self.path.htmlFile)().done(function(data){
                        self.data.htmlFile = data;
                    });
                })
                .then(function(){
                    return self.match(self.pattern, self.data.htmlFile, 1)().done(function(matched){
                        self.data.matched = matched;
                    });
                })
                .then(self.buildUntilHashIfNeeded())
                .then(self.ifAnyHashReplacePlaceholder())
                .then(function(data){
                    return self.writeFile(self.path.tmp_skeleton, data)();
                })
                .then(self.compileSkeleton())
                .then(self.createServerAndServeOnRequest(self.path.htmlFile))
                .then(self.renderWebpage(self.path.webpage))

            .fail(function(value){
                console.log('fail,', value);
            })
            .done(function(result){
                console.log('finished');
            });
        },

        on : function(value, callback){

            if(!this[value]){
                this['on'+capitalize(value)] = callback;
            } else {
                callback.call(this);
            }

        },
        coreHTMLFileExists : function(){

            return function(){
                return $.Deferred(function(dfd){
                    self.readFile(self.path.htmlFile)().done(function(){
                        dfd.resolve();
                    }).fail(function(){dfd.reject('FileNotFound, cant load [' + self.path.htmlFile + '] file!');});
                });
            };

        },
        buildUntilHashIfNeeded : function(){

            return function(){
                return $.Deferred(function(dfd){

                    var hashContainer = [],
                        length = self.data.matched.length,
                        matched = self.data.matched;

                    if(length===1){
                        self.data.untilHash = '('+matched[0].join(' ').replace(' ', ' : ') + ')';
                    } else if(length>1) {
                        matched.forEach(function(element){
                            hashContainer.push(element.join(' : '));
                        });
                        self.data.untilHash = '( '+hashContainer.join(', ') + ' )';
                    }
                    dfd.resolve(self.data.untilHash);
                });
            };

        },
        ifAnyHashReplacePlaceholder : function(){

            return function(){
                return $.Deferred(function(dfd){
                    if(self.data.matched.length){
                        self.data.skeleton = self.data.skeleton.replace(/[^$](__skeleton-until-navs-as-hash__)/gmi, function(match, p1){
                            var res = '', bool;
                            bool = p1==='__skeleton-until-navs-as-hash__' ? res = self.data.untilHash : null;
                            return res;
                        });
                    }
                    dfd.resolve(self.data.skeleton);
                });
            };

        },
        compileSkeleton : function(){
            return function(){
                return $.Deferred(function(dfd){
                    exec('sass '+self.path.tmp_skeleton+' '+self.name+'.css', function(code) {
                        if(code===1) { dfd.reject('Error:'+code); }
                        self.compile = true;
                        if(self.onCompile!==void(0)){ self.onCompile.call(self); }
                        dfd.resolve(true);
                    });
                });
            };
        },
        createServerAndServeOnRequest : function(serve){

            return function(){
                return $.Deferred(function(dfd){
                    webapp.templateExtension = '.html';
                    webapp.get('/index', function(){
                        this.set({
                            header : 'im header of index',
                            footer : 'im footer of index'
                        });
                        this.render();
                    });
                    dfd.resolve(true);
                });
            };
        },
        renderWebpage : function(){
            return function(){
                return $.Deferred(function(dfd){
                    /*
                    var childArgs = [
                        path.join(__dirname, 'phantom/webserver.js'), serve
                    ];
                    childProcess.execFile(phantom, childArgs, function(err, stdout, stderr) {
                        console.log('err', err);
                        console.log('stdout', stdout);
                        console.log('stderr', stderr);
                    });
                    */
                    dfd.resolve(true);
                });
            };
        },
        // > Helper-Promise Methods
        binExists : function(bin){

            return function(){
                return $.Deferred(function(dfd){
                    var resolved, message, res;
                    try {
                        which.sync(bin); resolved=true;
                    } catch (e) {
                        message = 'Please Install Sass'; resolved=false;
                    }
                    res = resolved ? dfd.resolve(true) : dfd.reject(false);
                });
            };

        },
        readFile : function(filename, charset){
            return function(){
                return $.Deferred(function(dfd){
                    charset = charset || 'utf8';
                    fs.readFile(filename, charset, function(err, data) {
                        if(err) {
                            dfd.reject('FileNotFound, cant load [' + filename + '] file!');
                        } else {
                            dfd.resolve(data);
                        }
                    });
                });
            };

        },
        copy : function(source, destination){
            return function(){
                return $.Deferred(function(dfd){
                    dfd.resolve(true);
                });
            };
        },
        mkdirp : function(path){

            return function(){
                return $.Deferred(function(dfd){
                    mkdirp(path, function(err){
                        // > ist das so möglich? wenn reject, wird dann auch resolve aufgerufen?
                        if(err){ dfd.reject(err); }
                        dfd.resolve(path);
                    });
                });
            };

        },
        writeFile : function(filename, data, chmod){

            return function(){
                return $.Deferred(function(dfd){

                    data  = data  || ' ';
                    chmod = chmod || '0777';

                    fs.writeFile(filename, data, function (err) {
                        if(err) { dfd.reject('FileCouldNotWrite cant write [' + filename + '] file!'); }
                        fs.chmod(filename, chmod, function(){
                            dfd.reject('PermissionDenied cant set chmod [' + chmod + ']');
                        });
                        dfd.resolve(data);
                    });

                });
            };

        },
        match : function(pattern, data, slice_start, slice_end){

            return function(){
                return $.Deferred(function(dfd){
                    var matches = [], tmpMatches = [], match;
                    // > bei regex "g" nicht vergessen anzugeben z.B. /foo/g
                    while ((match = pattern.exec(data)) && match[0]!==void(0)) {
                        tmpMatches = [];
                        for(var i= ( slice_start || 0 ), length=( slice_end || match.length ); i<length; i++){
                            tmpMatches.push(match[i]);
                        }
                        matches.push(tmpMatches);
                    }
                    dfd.resolve(matches);
                });
            };

        },

        _watchIfNeeded : function(){},
        _minifyIfNeeded : function(){},
        _finally : function(){
            this._watchIfNeeded();
            this._minifyIfNeeded();
        }
    };

    cli_skeleton
        .version('0.0.1')
        .usage('[options] <file ...>')
        .option('-i, --install', 'install skeleton')
        .option('-p, --path <source>, <default> index.html', 'source to configured html file')
        .option('-b, --base', 'base path')
        .option('-w, --watch', 'watch file')
        .option('-m, --minify', 'minify generated file')
        .option('-n, --normalize', 'normalize css')
        .parse(process.argv);

    if(require.main === module) {
        new NodeSkeleton({
            // > TODO: muss noch eingebaut werden
            normalizeCss : cli_skeleton.normalize || false,
            watch : cli_skeleton.watch || false,
            minify : cli_skeleton.minify || false,
            // > FIXME: base path funktioniert nicht
            base : cli_skeleton.path || '',
            path : {
                'htmlFile' : cli_skeleton.path || './index.html',
                'skeleton' : cli_skeleton.skeletonSassPath || './scss/skeleton.scss',
                'tmp' : cli_skeleton.tmpPath || 'tmp',
                'tmp_skeleton' : cli_skeleton.skeletonTmpSassPath || './tmp/tmp-skeleton.scss'
            },
            'onReady' : function(){
                console.log('ready');
            },
            'onCompile' : function(){
                console.log('compile');
            },
            'onRender' : function(){
                console.log('render');
            }
        });
    } else {
        module.exports = NodeSkeleton;
    }

}());