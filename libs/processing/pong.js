(function(){

    'use strict';

    var i = 0;

    process.on('message', function(data){
        process.stdout.write('receive message from: '+data+"\n");
    }.bind(this));

    var timeout = setInterval(function(){
        process.send('im pong;'+i); i++;
    }.bind(this), 2000);

}());