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

    var which  = require('which'),
        fs     = require('fs-extra'),
        mkdirp = require('mkdirp'),
        env    = require('jsdom').env,
        $      = {};

    function NodeSkeleton(undefined, callbacks){

        this.args = arguments[0];
        this.callbacks = callbacks || {};
        this.matched  = [];
        this.sk_scss_data = '';
        this.pattern = /sk-(left|top|bottom|right)-nav(?:.*?)data-sk-align="static:until\((\d+px)\)"/gm;

        this.path = {
            'skeletonCore' : './sass/skeleton.scss',
            'skeleton_tmp' : './tmp/tmp-skeleton.scss',
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

            var self = this;

            $.when(true)
                // > Checks
                .then(self.binExists('sass'))
                .then(self.maxPassedArgs(self.args, 2))
                .then(self.checkAndSetPassedArgs())
                .then(self.mkdirp('tmp'))
                .then(self.writeFile(self.path.skeleton_tmp))
                .then(function(){
                    return self.readFile(self.path.htmlFile)();
                })
                .then(function(data){
                    self.match(self.pattern, data, 1)().done(function(matched){
                        self.matched = matched; console.log(self.matched);
                    });
                })
                // > Business-Logic

            .fail(function(value){
                console.log('fail,', value);
            })
            .done(function(/*value*/){
                //console.log(self.path.htmlFile);
                //console.log(value);
                //console.log('all done');
            });
        },

        // > Business-Logic Methods
        checkAndSetPassedArgs : function(){

            var self = this;

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