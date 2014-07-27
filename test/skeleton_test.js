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


// >>> !!! Tests bitte direkt( momentan ) in Webstorm ausführen( rechte Maustaste -> Run )
/*
var instance = new Skeleton(['--path', '../index.html']);

instance.on('ready', function(){

});
instance.on('complete', function(){
    this.compile();
});
*/
new Skeleton(['--path', '../index.html'], {
    onReady : function(){

        // settings

        var self = this;

        this.path = {
            'skeleton' : '../scss/skeleton.scss',
            'tmp_skeleton' : '../tmp/tmp-skeleton.scss',
            'tmp' : '../tmp'
        };

        // >> match testing

        this.match(/foo/g, 'bar foo xbar', 0)().done(function(data){
            test.equal('foo', data[0][0], 'Testing match');
        });
        this.match(/foo/g, 'bar foo xfoo')().done(function(data){
            test.equal(2, data.length, 'Testing match length');
        });

        // >> binExists Testing

        this.binExists('sass')().done(function(data){
            test.equal(true, data, 'sass bin Exists');
        });
        this.binExists('bower')().done(function(data){
            test.equal(true, data, 'bower bin Exists');
        });
        this.binExists('chucky')().fail(function(data){
            test.equal(false, data, 'chucky bin not Exists');
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

        // >> buildUntilHashIfNeeded

        this.data.matched = [];
        this.buildUntilHashIfNeeded()().done(function(data){
            test.equal(null, data, 'buildUntilhashIfNeeded no hash');
        });

        this.data.matched = [ ['right', '700px']];
        this.buildUntilHashIfNeeded()().done(function(data){
            test.equal('(right : 700px)', data, 'buildUntilhashIfNeeded single hash');
        });

        this.data.matched = [
            ['right', '700px'],
            ['left', '500px'],
            ['top', '50px'],
            ['bottom', '100px']
        ];
        this.buildUntilHashIfNeeded()().done(function(data){
            test.equal(
                '( right : 700px, left : 500px, top : 50px, bottom : 100px )',
                data, 'buildUntilhashIfNeeded multiple hash'
            );
        });

        // > match until

        var indexHTMLMock1 = '../test/htmlIndexMocks/index_fixture_1.html',
            indexHTMLMock2 = '../test/htmlIndexMocks/index_fixture_2.html',
            indexHTMLMock3 = '../test/htmlIndexMocks/index_fixture_3.html',
            indexHTMLMock4 = '../test/htmlIndexMocks/index_fixture_4.html';


        this.$.when(this.readFile(indexHTMLMock1)())
            .then(function(data){
                self.match(self.pattern, data, 1)().done(function(matched){
                    console.log(matched);
                });
            });

        this.$.when(this.readFile(indexHTMLMock2)())
            .then(function(data){
                self.match(self.pattern, data, 1)().done(function(matched){
                    console.log(matched);
                });
            });

        this.$.when(this.readFile(indexHTMLMock3)())
            .then(function(data){
                self.match(self.pattern, data, 1)().done(function(matched){
                    console.log(matched);
                });
            });

        this.$.when(this.readFile(indexHTMLMock4)())
            .then(function(data){
                self.match(self.pattern, data, 1)().done(function(matched){
                    console.log(matched);
                });
            });

    }
});