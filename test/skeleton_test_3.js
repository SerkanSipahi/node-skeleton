

var Skeleton = require('../node-skeleton.js');

var instance = new Skeleton({
    base : '../',
    path : {
        htmlFile : 'index.html',
        skeleton : 'scss/skeleton.scss',
        tmp_skeleton : 'tmp/tmp-skeleton.scss',
        tmp : 'tmp'
    }
});

instance.on('complete', function(){
    console.log('onComplete');
});

instance.on('ready', function(){
    console.log('onReady');
});