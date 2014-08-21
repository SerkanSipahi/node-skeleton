(function(){
    'use strict';

    var childProcess = require("child_process");

    function Processing(path){
        this.process = childProcess.fork(path);
        this.processName = '';
        this.processId   = null;
    }

    module.exports = Processing;

}());