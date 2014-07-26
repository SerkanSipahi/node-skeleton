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

    var self   = {},
        which  = require('which'),
        fs     = require('fs-extra'),
        mkdirp = require('mkdirp'),
        bower  = require('bower'),
        /*
         * wird für das kopieren von Dateien/Verzeichnisse benötigt!
         * z.B. liya.js aus bower_components nach vendor.
         * liya.js wird in browser-node benötigt
         *
         **/
        ncp    = require('ncp').ncp,
        env    = require('jsdom').env,
        $      = {};

    function NodeSkeleton(undefined, callbacks){

        self = this;

        this.args = arguments[0];
        this.callbacks = callbacks || {};
        this.pattern = /sk-(left|top|bottom|right)-nav(?:.*?)data-sk-align="static:until\((\d+px)\)"/gm;

        this.data = {
            matched  : [],
            skeleton : null,
            htmlFile : null
        };
        this.path = {
            'skeleton' : './scss/skeleton.scss',
            'tmp_skeleton' : './tmp/tmp-skeleton.scss',
            'htmlFile' : ''
        };
        this.cmd = {
            '--path' : true,
            '--show' : true
        };
        this.errorMessages = {

        };

        env('-', function (errors, window) {
            $ = require('jquery')(window);
            this.init();
            if(this.callbacks.onReady!==void(0)){
                this.callbacks.onReady.call(this);
            }
        }.bind(this));

    }
    NodeSkeleton.prototype = {

        init : function(){

            $.when(true)
                // > Checks / Inits
                .then(self.binExists('bower'))
                .then(self.binExists('sass'))
                .then(self.maxPassedArgs(self.args, 2))
                /*
                 * Wenn folgendes implementieren:
                 * https://www.npmjs.org/package/commander
                 * */
                .then(self.checkAndSetPassedArgs())
                .then(self.mkdirp('tmp'))
                .then(self.writeFile(self.path.tmp_skeleton))
                .then(function(){
                    return self.readFile(self.path.htmlFile)().done(function(data){
                        self.data.htmlFile = data;
                    });
                })
                .then(function(){
                    return self.readFile(self.path.skeleton)().done(function(data){
                        self.data.skeleton = data;
                    });
                })
                // > Business-Logic
                .then(function(){
                    return self.match(self.pattern, self.data.htmlFile, 1)().done(function(matched){
                        self.data.matched = matched;
                    });
                })
            .fail(function(value){
                console.log('fail,', value);
            })
            .done(function(result){
                //console.log(result);
                //console.log('all done');
            });
        },

        // > Business-Logic Methods
        checkAndSetPassedArgs : function(){

            return function(){
                return $.Deferred(function(dfd){
                    if(!self.cmd[self.args[0]]){
                        dfd.reject('Ungültiger Parameter: ' + self.args[0]);
                    } else {
                        self.readFile(self.args[1])().done(function(){
                            self.path.htmlFile = self.args[1]; dfd.resolve();
                        }).fail(function(){dfd.reject('FileNotFound, cant load [' + self.args[1] + '] file!');});
                    }
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
        maxPassedArgs : function(args, max){

            return function(){
                return $.Deferred(function(dfd){
                    args = args || [];
                    if(args.length!==max){
                        dfd.reject('Sie müssen mindestens '+max+' Parameter übergeben z.B. index.html --path');
                    }
                    dfd.resolve(true);
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

        }
    };

    if(require.main === module) {
        new NodeSkeleton(process.argv.slice(2));
    } else {
        module.exports = NodeSkeleton;
    }

}());