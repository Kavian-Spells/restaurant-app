const pgp = require('pg-promise')()

var db = pgp({
    host: 'localhost',
    port: 5432,
    database: 'restaurant',
    user: 'postgres',
    password: 'PhirstofA11',
});

module.exports = db;
//If you wanted to export multiple functions:
//exports.function = function