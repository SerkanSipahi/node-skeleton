'use strict';


var Skeleton = require('../skeleton.js');

new Skeleton(['--path', 'index.html'], {
    onReady : function(){
        this.match(/foo/g, 'bar foo xbar')().done(function(){

        });
    }
});

exports.testSomething = function(test){
    test.expect(1);
    test.ok(true, "this assertion should pass");
    test.done();
};

