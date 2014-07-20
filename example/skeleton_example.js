
(function(){

    'use strict';

    var cmdArgs  = process.argv.slice(2),
        Skeleton = require('../skeleton.js');

    new Skeleton(!cmdArgs.length ? ['--path', 'index.html'] : cmdArgs);


}());
