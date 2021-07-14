// set up ======================================================================
//Create the server
var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);

var db = require('./db/db'); //database connection

// configuration ===============================================================
//setup express templating
var es6Renderer = require('express-es6-template-engine');
app.engine('html', es6Renderer);
app.set('views', 'templates');
app.set('view engine', 'html');

//setup express middleware -----------
var morgan      = require('morgan'); //morgan - logging req.method (get, post, etc.) and req.path (/, /home, /search)
app.use(morgan('dev'));

var body_parser = require('body-parser'); //body-parser => request.body
app.use(body_parser.urlencoded());

app.use(express.static('public')); //serve static files (css, js, etc.) outside of node and express
app.use(express.json()); //??? => Came from youtube

// routes ======================================================================
// home -----------
app.get('/', (req, res) => {
   res.render('index', {
        locals: {
            title: 'Restaurant Reviewer App',
        },
        partials: {
            header: './partials/header'
        }
    })
});

// search results -----------
app.get('/search', async (req, res) => {
    var searchTerm = req.query.searchTerm || 'Default';

    var restaurants = await db.any(`SELECT * FROM restaurant WHERE name ILIKE '%${searchTerm}%'`)
        .then(data => {return data})
        .catch(error => {console.log(error)})
        // console.log("dbdata", restaurants);
        if (restaurants) {
            res.render('search_results', {
                locals: {
                    title: 'Search Results',
                    restaurants: restaurants 
                },
                partials: {
                    header: './partials/header',
                    footer: "./partials/footer"
                }
            });
        } else {
            res.status(404) //Returning empty array, no error message showing
                .send(`no restaurants returned in your search`)
        }
    });

// restaurant pages -----------
app.get('/restaurant/:id', async (req, res) => {
    // pull restaurant id from database
    var {id} = req.params;
    // console.log("req.params id", id)

    var restaurant = await db.one(`SELECT * FROM restaurant WHERE id = ${id}`)
    var review = await db.any(`SELECT *
        FROM reviewer
        FULL OUTER JOIN review
        ON review.reviewer_id = reviewer.id
        WHERE restaurant_id = ${id};`)
    // console.log('review', review)
    
    .then(data => {return data})  
    .catch(error => {console.log(error)})
    // console.log("one restaurant", restaurant)
    
    if (review) {
        res.render('restaurant', {
            locals: {
                oneRestaurant: restaurant,
                title: `Restaurant info`, //can't get `${oneRestaurant.name}'s info` to work. Something about how db is mapped
                // reviewer: reviewer,
                review: review,
            },
            partials: {
                header: './partials/header',
                footer: "./partials/footer"
            }
        });
    } else {
        res.status(404)
            .send(`Restaurant has not been added`)
    }
});

// Write a Review feature: -----------
app.post('/restaurant/submit_review', async function (req, res, next) { 
    console.log('review form', req.body);
    
    //Write form data (req.body) to database
    try {
        var user_data = await db.result(`INSERT INTO reviewer VALUES (default, '${req.body.reviewerName}', '${req.body.reviewerEmail}', NULL) RETURNING id`)
        var new_userId = user_data.rows[0].id; // reviewer_id from the previous insert ^
        // console.log('new_userId', new_userId);
        var user_review = await db.result(`INSERT INTO review VALUES (default, '${req.body.reviewTitle}', '${req.body.review}', '${parseInt(req.body.rating)}', '${parseInt(new_userId)}', '${parseInt(req.body.restaurant_id)}')`)
        res.redirect('back'); // redirect back to restaurant page and show new review
        
        // res.write('Review Successfully recorded! \n');
        // res.write(`You sent the Name:   "${req.body.reviewerName}"\n`);
        // res.write(`You sent the Email:  "${req.body.reviewerEmail}"\n`);
        // res.write(`You sent the Rating: "${req.body.rating}"\n`);
        // res.write(`You sent the Title:  "${req.body.reviewTitle}"\n`);
        // res.write(`You sent the Review: "${req.body.review}"`);
        // res.end()   
    } catch (error) {
        res.send(error)
    }
});

//Add a restaurant feature: -----------
app.get('/new_restaurant', async (req, res) => {
    try {      
        res.render('new_restaurant', {
            locals: {
                title: 'Add a new Restaurant',
            },
            partials: {
                header: './partials/header',
                footer: "./partials/footer"           
            }
        })
        //Add new restaurant to database
        // var newRes_data = await db.result(`INSERT INTO restaurant VALUES (default, '${req.body.reviewerName}', '${req.body.reviewerEmail}', NULL) RETURNING id`)
        // res.redirect('back');
    } catch (error) {
        console.log(error)
    }
})

app.post('/new_restaurant/submit', async function (req, res, next) { 
    //The user will be redirected to the restaurant page that they just created ("/restaurant/:id")
    try {
        console.log('new restaurant form: ', req.body);
        
        //Write form data (req.body) to database
        var newRes_data = await db.result(`INSERT INTO restaurant VALUES (default, '${req.body.newName}', '${req.body.newAddress}', '${req.body.newCategory}') RETURNING id`)
        // console.log(newRes_data);
        var new_ResId = newRes_data.rows[0].id; // restaurant.id from the previous insert ^
        // console.log('new_ResId: ', new_ResId);
        // var new_review = await db.result(`INSERT INTO review VALUES (default, NULL, NULL, NULL, NULL, '${parseInt(new_ResId)}')`)
        // res.send('New Restaurant Successfully Added! \n'); 
        res.redirect(`/restaurant/${new_ResId}`);
    } catch (error) {
        res.send(error)
    }
});


// User Login Feature: ----------------- Put in another file

// launch ======================================================================
var PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
    console.log(`Server running at http://127.0.0.1:${PORT}`);
});