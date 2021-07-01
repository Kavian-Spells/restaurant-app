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
app.get('/search', async (req, res) => { //YT
    var searchTerm = req.query.searchTerm || 'Default';
    
    var restaurants = await db.any(`SELECT * FROM restaurant WHERE name ILIKE '%${searchTerm}%'`)
    .then(data => {  return data  })
    .catch(error => {
        console.log(error)
    })
    console.log("dbdata", restaurants);
    res.render('search_results', {
        locals: {
            restaurants: restaurants 
        },
        partials: {
            footer: "./partials/footer"
        }
    });
});

// restaurant pages
app.get('/restaurant/:id', async (req, res) => {

    
    // pull restaurant id from database

    var {id} = req.params;
    console.log("req.params id", id)

    var restaurant = await db.one(`SELECT * FROM restaurant WHERE id = ${id}`)
        .then(data => {return data})  
        .catch(error => {
            console.log(error)
        })
        console.log("one restaurant", restaurant)
    if (restaurant) {
        res.render('restaurant', {
            locals: {
                oneRestaurant: restaurant 
            },
            partials: {
                footer: "./partials/footer"
            }
        });
    } else {
        res.status(404)
            .send(`no restaurant with id ${id}`)
    }
});

// launch ======================================================================
var PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});