var express = require('express');
var app = express();

app.use(express.static('public'));

var listener = app.listen(8080, '127.0.0.1', function() {
    console.log('Example app listening on port:127.0.0.1:' + listener.address().port);
});
