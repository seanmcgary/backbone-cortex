var _ = require('lodash');
var express = require('express');
var serveStatic = require('serve-static');
var fs = require('fs');
var path = require('path');

var dir = path.normalize(__dirname );
console.log(dir);

var app = express();

app.use(serveStatic('example'));

app.get('*', function(req, res, next){
	res.send(fs.readFileSync(dir + '/example.html').toString());
});

app.listen(9000, function(){

});
