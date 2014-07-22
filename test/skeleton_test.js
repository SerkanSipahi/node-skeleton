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
        }
    };

var test = new SimpleUnitTest();


// >>> !!! Tests bitte direkt( momentan ) in Webstorm ausführen( rechte Maustaste -> Run )

new Skeleton(['--path', '../index.html'], {
    onReady : function(){

        // >> match testing

        this.match(/foo/g, 'bar foo xbar')().done(function(data){
            test.equal('foo', data[0], 'Testing match');
        });
        this.match(/foo/g, 'bar foo xfoo')().done(function(data){
            test.equal(2, data.length, 'Testing match length');
        });

        // >> binExists Testing

        this.binExists('sass')().done(function(data){
            test.equal(true, data, 'bin Exists');
        });
        this.binExists('chucky')().fail(function(data){
            test.equal(false, data, 'bin not Exists');
        });

        // >> maxPassedArgs

        this.maxPassedArgs(['foo', 'bar', 'bubu'], 3)().done(function(arg){
            test.equal(true, arg, 'maxPassedArgs on successful');
        });

        this.maxPassedArgs(['foo', 'bar'], 3)().fail(function(arg){
            test.equal(
                'Sie müssen mindestens 3 Parameter übergeben z.B. index.html --path', arg,
                'maxPassedArgs on fail'
            );
        });

        // >> readFile

        this.readFile('fixture_file.txt')().done(function(data){
            test.equal('im foo in fixture file', data, 'this.readFile on done');
        });

        this.readFile('xxfixture_file.txt')().fail(function(data){
            test.equal('FileNotFound, cant load [xxfixture_file.txt] file!', data, 'this.readFile on fail');
        });

    }
});

exports.testSomething = function(test){
    test.expect(1);
    test.ok(true, "-----");
    test.done();
};

