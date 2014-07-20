'use strict';


var Skeleton = require('../skeleton.js'),
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
        }
    };

var test = new SimpleUnitTest();


new Skeleton(['--path', 'index.html'], {
    onReady : function(){

        this.match(/foo/g, 'bar foo xbar')().done(function(data){
            test.equal('foo', data[0], 'Testing match');
        });

        this.match(/foo/g, 'bar foo xfoo')().done(function(data){
            test.equal(2, data.length, 'Testing match length');
        });

        
    }
});

exports.testSomething = function(test){
    test.expect(1);
    test.ok(true, "-----");
    test.done();
};

