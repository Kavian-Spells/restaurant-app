var express = require('express');
var http = require('http');
var morgan = require('morgan');
var es6Renderer = require('express-es6-template-engine');
var body_parser = require('body-parser');
var pgp = require('pg-promise')();
var dbsettings = pgp(process.env.DATABASE_URL || {database: 'restaurant'});
var db = pgp(dbsettings);

var app = express();
var server = http.createServer(app);

// var { Server } = require("socket.io");
// const exp = require('constants');
// var io = new Server(server);

app.engine('html', es6Renderer);
app.set('views', 'templates');
app.set('view engine', 'html');

app.use(body_parser.urlencoded());
app.use(morgan('dev'));
// app.use('/socket-io', express.static('node_modules/socket.io/client-dist'));
app.use('/public', express.static('public'));

app.get('/', (req, res) => {
    res.send('Hello World');
});

var PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
    console.log('listening on port ', PORT);
});