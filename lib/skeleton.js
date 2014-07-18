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

    var which = require('which'),
        fs    = require('fs-extra'),
        path  = require('path'),
        $     = require('jquery-deferred');

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

        this.init();

    }
    Skeleton.prototype = {

        init : function(){

            var checks = $.when(this.binExists('sass'))
                .then(function(value){
                    console.log(value); return value+'::ok';
                })
                .then(function(value){
                    console.log(value);
                })
                .fail(function(value){
                    console.log(value);
                });

            var tasks = {};

            var test = this.test('this is thest').done(function(value){
                console.log(value);
            });


        },
        test : function(value){

            return function(value){
                var _dfd = new $.Deferred();
                _dfd.resolve(value);
                return _dfd.promise();
            }(value);

        },
        checkAndSetPassedArgs : function(){

            var _dfd = new $.Deferred();

            if(!this.cmd[this.args[0]]){
                _dfd.reject('ungültiger Parameter: ' + this.args[0]);
            } else {
                // > save .html path
                this.readFile(this.args[1]).done(function(){
                    this.path.htmlFile = this.args[1];
                }.bind(this));
            }

            return _dfd.promise();

        },
        maxPassedArgs : function(args, max){

            var _dfd = new $.Deferred();
            if(this.args.length<2){
                _dfd.reject('Sie müssen mindestens '+max+' Parameter übergeben z.B. index.html --path');
            }
            _dfd.resolve(200);

        },
        binExists : function(bin){

            var _dfd = new $.Deferred(), resolved, res, message;

            try {
                which.sync(bin); resolved=true;
            } catch (e) {
                message = 'Please Install Sass'; resolved=false;
            }

            resolved ? _dfd.resolve(200) : _dfd.reject(message);
            return _dfd.promise();
        },
        match : function(pattern, data, slice_start, slice_end){

            var _dfd = new $.Deferred(),
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
        readFile : function(filename, charset){

            var _dfd = new $.Deferred(),
                _charset = charset || 'utf8';

            fs.readFile(filename, _charset, function(err, data) {
                if(err) { _dfd.reject('FileNotFound', 'cant load [' + filename + '] file!'); }
                _dfd.resolve(data);
            });

            return _dfd.promise();
        },
        writeFile : function(filename, data, chnmod){

            var _dfd    = new $.Deferred(),
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

        }
    };

    if(require.main === module) {
        new Skeleton(process.argv.slice(2));
    } else {
        module.exports = Skeleton;
    }

}());