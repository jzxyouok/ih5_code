var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var route = require('./route');

var app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text({ limit: '50mb' }));

var webpack = require('webpack');
var config = require('./webpack.config');
var compiler = webpack(config);

app.use(require('webpack-dev-middleware')(compiler));
app.use(require('webpack-hot-middleware')(compiler));

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'src', 'index.html'));
});

app.get('/ih5bridge.js', function(req, res) {
  res.sendFile(path.join(__dirname, 'ih5bridge.js'));
});

app.get('/ih5core.js', function(req, res) {
  res.sendFile(path.join(__dirname, 'ih5core.js'));
});

route(app);

app.listen(process.env.PORT || 8000, 'localhost');
