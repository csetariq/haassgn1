var fs = require('fs');
var http = require('http');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;

var httpServer = http.createServer(function(req, res) {
    unifiedServer(req, res);
});

httpServer.listen(3000, function() {
    console.log('HTTP server is listening on ' + 3000);
})

var unifiedServer = function(req, res) {
    var parsedUrl = url.parse(req.url, false);
    var path = parsedUrl.pathname.replace(/^\/+|\/+$/g, '');
    var method = req.method;

    var decoder = new StringDecoder('utf-8');
    var buffer = '';

    req.on('data', function(data) {
        buffer += decoder.write(data);
    });

    req.on('end', function(data) {
        buffer += decoder.end(data);

        var chosenHandler = typeof(router[path]) !== 'undefined' ? router[path] : router.notFound;

        var data = {
            method: method,
            path: path,
            payload: buffer
        };

        chosenHandler(data, function(statusCode, payload) {
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
            payload = typeof(payload) == 'object' ? payload : {};

            var payloadString = JSON.stringify(payload);

            res.setHeader('Content-Type', 'application/json');
            res.writeHeader(statusCode);
            res.end(payloadString);
        });
    });
    
}

var handlers = {};

handlers.hello = function(data, callback) {
    var who = typeof(data.payload) == 'string' && data.payload.length > 0 ? data.payload : 'World';
    callback(200, {message: 'Hello, ' + who + '!'});
}

handlers.notFound = function(data, callback) {
    callback(404);
}

var router = {
    'hello': handlers.hello,
    'notFound': handlers.notFound
}
