var express = require('express');
var http = require('http');
var morgan = require('morgan');
var es6Renderer = require('express-es6-template-engine');
var body_parser = require('body-parser');
var pgp = require('pg-promise')({});
var db = pgp({
    host: 'localhost',
    port: 5432,
    database: 'restaurant',
    user: 'postgres',
    password: 'PhirstofA11',
    max: 30 // use up to 30 connections
});
// var dbsettings = pgp(process.env.DATABASE_URL;
//     if (!dbsettings) {

//     }{database: 'restaurant'});
// var db = pgp(dbsettings);

var app = express();
var server = http.createServer(app);

var router = express.Router() //YT

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

app.use(express.json()); //YT


app.get('/', (req, res) => {
    res.render('index');
});

router.get('/search', (req, res) => { //YT
    db.query('SELECT * FROM restaurant');
});


// app.get('/', async (req, res) => {
//     var restaurants = await db.query('SELECT * FROM restaurant');
//     res.render('search');
// });

// app.get('/search', (req, res) => {
//     res.render('search');
// })

// app.get('/:search', function (req, res) {
//     var searchTerm = req.query.searchTerm || 'Default';
//     res.send(`Here are the results of your ${searchTerm} search`);
//   });



// app.get('/:search', function (req, res) {
//     var searchTerm = req.query.searchTerm || 'Default';
//     var restaurants = await db.query('SELECT * FROM restaurant');
//     res.render('search');
// });

var PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});