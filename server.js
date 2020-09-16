var express = require('express');
var dotenv = require('dotenv');
var bodyParser = require('body-parser')

var fs = require('fs');
var formidable = require('formidable');

dotenv.config();

var app = express();
var port = 3001;

app.use(bodyParser.json({limit: '50mb', extended: true}))

app.use(express.static('public'));

app.use('/scripts', express.static(`${__dirname}/node_modules/`));

app.use('/', function(req, res) { 

	res.sendFile(`${__dirname}/public/index.html`)

});

app.listen(port, function () {
  console.info('listening on %d', port);
});