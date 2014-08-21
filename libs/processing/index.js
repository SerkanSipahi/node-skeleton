(function(){

    'use strict';
    /*
    var Process = require('./processing');

    var ping = new Process('./ping'),
        pong = new Process('./pong');


    ping.process.send('master ping');
    pong.process.send('master pong');

    var numCPUs = require('os').cpus().length;

    console.log(numCPUs);
    */
    var launcher;
    launcher = require('./cluster_launcher');
    console.log('Launching cluster');
    launcher.launch();

    /*
    function Channel(){}
    Channel.prototype = {
        channel : {
            receive : {},
            send : {}
        },
        addProcesses : {}
    };

    // > =============== > //

    function Requesthandler(){

        this.channel['c1'].receive('responseHandler', this.fooMethod);
        this.channel['c1'].receive('all', this.fooMethod);

    }
    Requesthandler.prototype = {
        fooMethod : function(data){

        },
        barMethod : function(){

            this.process.send({});

            this.channel['c1'].send('renderer', {
                method : 'index',
                requestData : [1,2,3,4]
            });
            this.channel['c1'].send('all', {
                method : 'index',
                requestData : [1,2,3,4]
            });
        }
    };

    function Renderer(){}
    Renderer.prototype = {
        fooMethod : function(){

        },
        barMethod : function(){

        }
    };

    function Responsehandler(){}
    Responsehandler.prototype = {
        fooMethod : function(){

        },
        barMethod : function(){

        }
    };
    */
    // > =============== > //

    // > diese können innerhalb und auerhalb der klassen genutzt werden

    // requesthandler.processSend({daten: 1234});
    // renderer.processSend({daten: 1234});
    // responseHandler.processSend({daten: 1234});

    // requesthandler.processOn('message', function(data){});
    // renderer.process.processOn('message', function(data){});
    // responseHandler.processOn('message', function(data){});

    // > das wird für die channels benötigt
    // requesthandler.processName = 'requesthandler';   // > wird von Process generiert
    // renderer.processName = 'renderer';               // > wird von Process generiert
    // responseHandler.processName = 'responsehandler'; // > wird von Process generiert

    /*
     * das channel ist eigentlich auch ein process!
     * Nur dieser dient nur als publisher, also Proxy!
     * Kann daten empfangen und sie zum richtigen process weiterleiten
     *
     * @constructor String ; the name of channel name
     *
     * */
    /*
    var channel1 = new Channel('c1');

    channel1.addProcesses([
        requesthandler,
        renderer,
        responseHandler
    ]);
    */
}());