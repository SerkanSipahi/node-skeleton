'use strict';


var Skeleton = require('../node-skeleton.js'),
    SimpleUnitTest = function(){
        this.i=1;
    };
SimpleUnitTest.prototype = {
    equal : function(except, tobe, describe){
        if(except===tobe){
            console.log(this.i+': ( '+describe+' )', 'ok');
        } else {
            console.log(this.i+': ( '+describe+' )', 'fail, except:', except+' === tobe: '+tobe);
        }
        this.i++;
    },
    contain : function(item, array){

    },
    _consoleLog : function(){

    }
};

var test = new SimpleUnitTest();

var skeleton = new Skeleton({
    base : '../',
    path : {
        htmlFile : '../index.html',
        skeleton : '../scss/skeleton.scss',
        tmp_skeleton : '../tmp/tmp-skeleton.scss',
        tmp : 'tmp'
    },
    'onReady' : function(){
        console.log('onReady')
    },
    'onCompile' : function(){
        console.log('compile');
    },
    'onRender' : function(){
        console.log('onRender');
    }
});
