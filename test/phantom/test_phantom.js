/*
var page = require('webpage').create();

page.onInitialized = function() {
    page.evaluate(function(domContentLoadedMsg) {
        document.addEventListener('DOMContentLoaded', function() {
            var foo = document.querySelector('body').innerHTML;
            window.callPhantom(foo);
        }, false);
    });
};

page.onCallback = function(data) {
    console.log(data)
    console.log('DOMContentLoaded');
    phantom.exit(0);
};

page.open('http://phantomjs.org/');
*/
var http = require('http'),
    i    = 0;

http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    if(req.url === '/'){
        res.end('<h1>Couter: '+(i++)+'</h1>');
        console.log(__dirname);
    }
    if(req.url === '/favicon.ico'){
        res.end('serve:' + req.url);
    }
}).listen(1502);