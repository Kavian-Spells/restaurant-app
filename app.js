// set up ======================================================================
//Get all the tools you need
var express     = require('express');
var http        = require('http');
var es6Renderer = require('express-es6-template-engine');
var morgan      = require('morgan');
var body_parser = require('body-parser');
var db          = require('./db/db');

var app     = express();
var server  = http.createServer(app);

// configuration ===============================================================
//setup templates
app.engine('html', es6Renderer);
app.set('views', 'templates');
app.set('view engine', 'html');

//setup express application
app.use(body_parser.urlencoded());
app.use(morgan('dev'));
app.use('/public', express.static('public'));
app.use(express.json()); //YT

// routes ======================================================================
// home
app.get('/', (req, res) => {
    res.render('index');
});

// search results
app.get('/search', (req, res) => { //YT
    var searchTerm = req.query.searchTerm || 'Default';
    
    db.any(`SELECT * FROM restaurant WHERE name ILIKE '%${searchTerm}%'`)
    .then(data => {
        console.log(data);
        res.json(data) //How to use map statement and render html file
    })
    .catch(error => {
        console.log(error)
    })
});

// restaurant pages
app.get('/restaurant/:id', (req, res) => {
    res.sendfile('./templates/restaurant.html'); //res.render not working
    
    // pull restaurant id from database
    // var {id} = req.params;
    // var restaurant = db.one("SELECT * FROM restaurant WHERE id =1")
    //     .then(restaurant => {
    //     })  
    //     .catch(error => {
    //         console.log(error)
    //     })
    // if (restaurant) {
    //     // let htmlData = ``;
    //     // htmlData += `<h1>${restaurant.name}</h1>`;
    //     // htmlData += `<h1>${restaurant.id}</h1>`;
    //     // htmlData += `<h1>${restaurant.address}</h1>`;
    //     // htmlData += `<h1>${restaurant.category}</h1>`;
    //     // res.send(htmlData);
    //     res.render('restaurant');
    // } else {
    //     res.status(404)
    //         .send(`no restaurant with id ${id}`)
    // }
});

// launch ======================================================================
var PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});