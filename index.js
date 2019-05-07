var express = require('express');
// var router = express.Router();
var app = express();
var bodyParser = require('body-parser')
var routes = require('./routes');
var categories = require('./routes/categories');
var authorities = require('./routes/authorities');
var combinations = require('./routes/combinations');
// var connection  = require('express-myconnection');


app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

/** Serve our app on root path */
app.use('/', express.static(__dirname + '/app'));
	
/** Login API */
app.post('/login', routes.login);

/**
 * QUESTIONS *
 */

/** Get questions api */
app.get('/questions', routes.questions);

/** Get answers */
app.get('/keywords', routes.getAllKeywords);

/** Get answers */
app.get('/answers', routes.answers);

/** Add answers */
app.post('/addAnswer', routes.addAnswer);

/** Update answer */
app.post('/answers', routes.updateAnswer);

/** Update answer */
app.post('/deleteAnswer', routes.deleteAnswer);

/** Get keyword suggestions */
app.get('/keywordSuggestions', routes.keywordSuggestions);

/**
 * CATEGORIES *
 */

/** Get questions api */
app.get('/categories', categories.get);

app.post('/category', categories.add);

app.post('/updateCategory', categories.update);

app.post('/deleteCategory', categories.delete);

/**
 * AUTHORITIES
 */
app.get('/authorities', authorities.get);

app.post('/authority', authorities.add);

app.post('/updateAuthority', authorities.update);

app.post('/deleteAuthority', authorities.delete);

/**
 * COMBINATIONS
 */
app.post('/combinations', combinations.add);

/** If any other route just throw error */
app.get('*', function(req, res) {
  res.send('<H1>Bad route</H1>');
});

/** Creating simple server */
var server = app.listen(20057, function() {

	var host = server.address().address;
	var port = server.address().port;

	console.log('App listening at http://%s:%s', host, port);

});
