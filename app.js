var path = require('path');
var express = require('express');

var app = express();

app.get('/', function(req, res) {
    res.end('EXPERIMENTS!');
});

app.get('/void', function (req, res) {
   res.sendFile(path.join(__dirname, '/void', 'index.html'));
});
app.use('/void', express.static('void'));

app.use('/public', express.static('public'));
app.use('/helpers', express.static('helpers'));

app.listen(3000, function () {
    console.log('app listening on port 3000!');
});