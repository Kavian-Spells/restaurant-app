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

//setup express middleware-----------
var morgan      = require('morgan'); //morgan - logging req.method (get, post, etc.) and req.path (/, /home, /search)
app.use(morgan('dev'));

var body_parser = require('body-parser'); //body-parser => request.body
app.use(body_parser.urlencoded());

app.use(express.static('public')); //serve static files (css, js, etc.) outside of node and express
app.use(express.json()); //??? => Came from youtube

// routes ======================================================================
// home
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

// search results
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

// restaurant pages
app.get('/restaurant/:id', async (req, res) => {
    // pull restaurant id from database
    var {id} = req.params;
    // console.log("req.params id", id)

    var restaurant = await db.one(`SELECT * FROM restaurant WHERE id = ${id}`)
    var review = await db.many(`SELECT *
    FROM reviewer
    FULL OUTER JOIN review
    ON review.reviewer_id = reviewer.id
    WHERE restaurant_id = ${id};`)
    // var reviewer = await db.many(`SELECT * FROM reviewer WHERE id IN 
    //     (SELECT reviewer_id FROM review WHERE restaurant_id = ${id})`)
    .then(data => {return data})  
    .catch(error => {console.log(error)})
    // console.log("one restaurant", restaurant)
    // console.log("reviewer", reviewer)
    console.log('review', review)
    if (restaurant) {
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
            .send(`no restaurant with id ${id}`)
    }
});

// Write a Review feature:
app.post('/restaurant/submit_review', async function (req, res, next) { 
    console.log('review form', req.body);

    res.write('Review Successfully recorded! \n');
    res.write(`You sent the Name:   "${req.body.reviewerName}"\n`);
    res.write(`You sent the Email:  "${req.body.reviewerEmail}"\n`);
    res.write(`You sent the Rating: "${req.body.rating}"\n`);
    res.write(`You sent the Title:  "${req.body.reviewTitle}"\n`);
    res.write(`You sent the Review: "${req.body.review}"`);
    res.end()   

    //Write form data (req.body) to database
    try {
        var user_data = await db.result(`INSERT INTO reviewer VALUES (default, '${req.body.reviewerName}', '${req.body.reviewerEmail}', NULL) RETURNING id`)
        var new_userId = user_data.rows[0].id; // reviewer_id from the previous insert ^
        console.log('new_userId', new_userId);
        var user_review = await db.result(`INSERT INTO review VALUES (default, '${req.body.reviewTitle}', '${req.body.review}', '${parseInt(req.body.rating)}', '${parseInt(new_userId)}', '${parseInt(req.body.restaurant_id)}')`)
    } catch (error) {
        res.send(error)
    }
});

// redirect back to restaurant page and show new review

//Add a restaurant feature:
///restaurant/submit_new will be a post request where the db record is saved
    //The user will be redirected to the restaurant page that was just created
app.get('/new_restaurant', (req, res) => {
    try {      
        res.render('new_restaurant', {
            locals: {
                title: 'Add a new Restaurant',
            },
            partials: {
                header: './partials/header'
            }
        })
    } catch (error) {
        console.log(error)
    }
})


// User Login Feature - Middleware Lecture 6/12 ~45min
// THERE ARE MODULES THAT WILL DO USER LOGINS FOR YOU. ASK DURING CLASS

// app.use(function (request, response, next) {
//   if (request.session.user) {
//     next();
//   } else if (request.path == '/login') {
//     next();
//   } else {
//     response.redirect('/login');
//   }
// });

// app.get("/", function (request, response) {
//   response.send(`Hello ${request.session.user}`);
// });

// app.get('/login', function (request, response) {
//   response.sendFile(__dirname + '/login.html');
// });

// app.post('/login', function (request, response) {
//   var username = request.body.username;
//   var password = request.body.password;
//   console.log(username, password);

//   if (username == 'aaron' && password == 'narf') {
//     request.session.user = username;
//     response.redirect('/');
//   } else {
//     response.sendFile(__dirname + '/login.html');
//   }
// });

// launch ======================================================================
var PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
    console.log(`Server running at http://127.0.0.1:${PORT}`);
});