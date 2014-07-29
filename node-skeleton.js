#! /usr/bin/env node

/*
 * skeleton
 * https://github.com/SerkanSipahi/skeleton
 *
 * Copyright (c) 2014 Serkan Sipahi
 * Licensed under the MIT license.
 */

(function(){

    'use strict';

    var self         = {},
        which        = require('which'),
        fs           = require('fs-extra'),
        mkdirp       = require('mkdirp'),
        shelljs      = require('shelljs/global'),
        bower        = require('bower'),
        cli_skeleton = require('commander'),
        /*
         * wird für das kopieren von Dateien/Verzeichnisse benötigt!
         * z.B. liya.js aus bower_components nach vendor.
         * liya.js wird in browser-node benötigt
         *
         **/
        ncp    = require('ncp').ncp,
        env    = require('jsdom').env,
        $      = {},

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

        // > settings
        this.watch  = false;
        this.minify = false;
        this.path = {
            'skeleton'     : '',
            'tmp'          : '',
            'tmp_skeleton' : '',
            'htmlFile'     : ''
        };

        this.$ = {};

        /*
         * wenn alle nötigen parameter initialisiert sind,
         * aber nicht komplett( befor init() augerufen wird ) abgeschlossen.
         * */
        this.ready = false;
        this.onReady = void(0); // eventuell als function(){} vorbelegen;

        /*
         * wenn alle nötigen parameter initialisiert sind,
         * alles(then()) komplett abgeschlossen.
         * */
        this.complete = false;
        this.onComplete = void(0); // eventuell als function(){} vorbelegen;

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

        // > env is an async function
        env('-', function (errors, window) {

            this.ready = true;
            this.$ = $ = require('jquery')(window);

            if(this.onReady!==void(0)){
                this.onReady.call(this);
            }

            /*
             * Wenn über Konstruktor keine Argumente
             * übergeben werden, kann das init() nicht
             * aufgerufen werden!
             *
             * Argumente können über die setter Methoden
             * übergen werden. Init() muss dann manuell
             * angestossen werden.
             *
             **/
            var res = type(object)==='object' ? this.init() : null;

        }.bind(this));

    }
    NodeSkeleton.prototype = {

        init : function(){

            $.when(true)
                // > Checks / Inits
                // > binExists optimieren, mehrere args
                //   als array übergeben können
                .then(self.binExists('bower'))
                .then(self.binExists('sass'))
                .then(self.coreHTMLFileExists())
                .then(self.mkdirp(this.path.tmp)) //> absoluten path übergeben weil mkdirp /bar/bar/foo.txt erzeugen kann! also mit verzeichenissen!
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
                // > Business-Logic
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

            .fail(function(value){
                console.log('fail,', value);
            })
            .done(function(result){
                this.complete = true;
                if(this.onComplete!==void(0)){
                    this.onComplete.call(this);
                }
                this._finally();
            }.bind(this));
        },

        on : function(value, callback){
            this._callbackHandler(value, callback);
        },
        _callbackHandler : function(value, callback){

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

        // > Helper-Promise Methods
        binExists : function(bin){

            return function(){
                return $.Deferred(function(dfd){
                    var resolved, message, foo;
                    try {
                        which.sync(bin); resolved=true;
                    } catch (e) {
                        message = 'Please Install Sass'; resolved=false;
                    }
                    foo = resolved ? dfd.resolve(true) : dfd.reject(false);
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
        wait : function(time){

            return function(){
                return $.Deferred(function(dfd){
                    setTimeout(function(){
                        dfd.resolve(time);
                    }, time);
                });
            };

        },

        setHtmlfilePath : function(value){
            this.path.htmlFile = value; return this;
        },
        setSkeletonPath : function(value){
            this.path.skeleton = value; return this;
        },
        setTmpSkeletonPath : function(value){
            this.path.tmp_skeleton = value; return this;
        },
        setWatch : function(value){
            this.watch = value; return this;
        },
        setMinify : function(value){
            this.minify = value; return this;
        },

        _watchIfNeeded : function(){},
        _minifyIfNeeded : function(){},
        _compile : function(){
            exec('sass '+this.path.tmp_skeleton+' '+this.name+'.css', function(code, output) {
                if(code===1) { console.log('Error:', code); return; }
                console.log('Program output:', output);
            }.bind(this));
        },

        _finally : function(){
            this._watchIfNeeded();
            this._minifyIfNeeded();
            this._compile();
        }

    };

    cli_skeleton
        .version('0.0.1')
        .usage('[options] <file ...>')
        .option('-i, --install', 'install skeleton')
        .option('-p, --path <source>, <default> index.html', 'source to configured html file')
        .option('-w, --watch', 'watch file')
        .option('-m, --minify', 'minify generated file')
        .parse(process.argv);

    if(require.main === module) {
        new NodeSkeleton({
            watch : cli_skeleton.watch || false,
            minify : cli_skeleton.minify || false,
            path : {
                'htmlFile' : cli_skeleton.path || 'index.html',
                'skeleton' : cli_skeleton.skeletonSassPath || './scss/skeleton.scss',
                'tmp_skeleton' : cli_skeleton.skeletonTmpSassPath || './tmp/tmp-skeleton.scss',
                'tmp' : cli_skeleton.tmpPath || 'tmp' // >> kann eventuell raus, DRY !!!
            },
            'onReady' : function(){
                console.log('ready');
            },
            'onComplete' : function(){
                console.log('complete');
            }
        });
    } else {
        module.exports = NodeSkeleton;
    }

}());