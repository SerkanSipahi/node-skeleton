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
        path   = require('path'),
        mkdirp = require('mkdirp'),
        env    = require('jsdom').env,
        $      = {};

    function Skeleton(){

        this.args = arguments[0];
        this.matched  = [];
        this.sk_scss_data = '';
        this.pattern = /sk-(left|top|bottom|right)-nav(?:.*?)data-sk-align="static:until\((\d+px)\)"/gm;

        this.path = {
            'skeletonCore' : '../sass/skeleton.sass',
            'skeleton_tmp' : '../tmp/skeleton_tmp.scss',
            'htmlFile' : ''
        };
        this.cmd = {
            '--path' : true,
            '--show' : true
        };

        env('-', function (errors, window) {
            $ = require('jquery')(window);
            this.init();
        }.bind(this));

    }
    Skeleton.prototype = {

        init : function(){

            var self = this;

            $.when(true)
                // > checks
                .then(self.binExists('sass'))
                .then(self.maxPassedArgs(self.args, 2))
                .then(self.checkAndSetPassedArgs())
                .then(self.wait(1500))
                .then(self.mkdirp('tmp'))
                // > build sassfile

            .fail(function(value){
                console.log(value);
            })
            .done(function(value){
                console.log(self.path.htmlFile);
                console.log(value);
                console.log('all done');
            });

        },
        binExists : function(bin){

            return function(){
                return $.Deferred(function(dfd){
                    var resolved, message;
                    try {
                        which.sync(bin); resolved=true;
                    } catch (e) {
                        message = 'Please Install Sass'; resolved=false;
                    }
                    resolved ? dfd.resolve(200) : dfd.reject(message);
                });
            };

        },
        maxPassedArgs : function(args, max){

            return function(){
                return $.Deferred(function(dfd){
                    if(args.length<max){
                        dfd.reject('Sie müssen mindestens '+max+' Parameter übergeben z.B. index.html --path');
                    }
                    dfd.resolve(200);
                });
            }

        },
        checkAndSetPassedArgs : function(){

            var self = this;

            return function(){
                return $.Deferred(function(dfd){
                    if(!self.cmd[self.args[0]]){
                        dfd.reject('ungültiger Parameter: ' + self.args[0]);
                    } else {
                        self.readFile(self.args[1])().done(function(data){
                            self.path.htmlFile = self.args[1]; dfd.resolve();
                        }).fail(function(){dfd.reject('FileNotFound, cant load [' + self.args[1] + '] file!')});
                    }
                });
            }
        },
        readFile : function(filename, charset){

            return function(){
                return $.Deferred(function(dfd){
                    var _charset = charset || 'utf8';
                    fs.readFile(filename, _charset, function(err, data) {
                        if(!err) {
                            dfd.resolve(data);
                        } else {
                            dfd.reject('FileNotFound, cant load [' + filename + '] file!');
                        }
                    });
                });
            }

        },
        mkdirp : function(path){

            return function(){
                return $.Deferred(function(dfd){
                    mkdirp(path, function(err){
                        if(err){ dfd.reject(err); }
                        dfd.resolve('mkdirp done!');
                    });
                });
            }

        },
        writeFile : function(filename, data, chmod){

            var _dfd   = $.Deferred(),
                _data  = data  || ' ',
                _chmod = chmod || '0777';

            fs.writeFile(filename, _data, function (err) {
                if(err) { _dfd.reject('FileCouldNotWrite', 'cant write [' + filename + '] file!'); }
                fs.chmod(filename, _chmod, function(){
                    _dfd.reject('PermissionDenied', 'cant set chmod [' + _chmod + ']');
                });
                _dfd.resolve(200);
            });
            return _dfd.promise();

        },
        match : function(pattern, data, slice_start, slice_end){

            var _dfd = $.Deferred(),
                match, container=[], tmpContainer=[];

            while(match!==null){
                match = pattern.exec(data);
                if(match!==null){
                    tmpContainer=[];
                    for(var i= ( slice_start || 0 ), length=( slice_end || match.length ); i<length; i++){
                        tmpContainer.push(match[i]);
                    }
                    container.push(tmpContainer);
                }
            }
            _dfd.resolve(container);
            return _dfd.promise();
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
        new Skeleton(process.argv.slice(2));
    } else {
        module.exports = Skeleton;
    }

}());