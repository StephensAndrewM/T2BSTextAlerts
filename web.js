var DB_NAME = 't2bs-textalerts';

var express = require('express'),
	http = require("http")
var app = express();

// Handle Default Route for Static Files
app.use("/", express.static(__dirname+"/static"));

// Mongo Initialiation
var mongoUri = process.env.MONGOLAB_URI ||
	process.env.MONGOHQ_URL ||
	'mongodb://localhost/'+DB_NAME;
var mongo = require('mongodb');

// Connect to Database Itself
var db; var dbError;
mongo.Db.connect(mongoUri, function (error, databaseConnection) {
	if (error) { dbError = error; }
	else { db = databaseConnection; }
});





// Populates Admin Area with Stored Data
app.get('/admindata', function(req, res)) {

	// Get Recent Messages
	
	// Get Registered Users
	 
	// Get Suggestions

}

// Submission of Suggestion on Front-End
app.post('/suggest', function(req, res)) {

	// Check if Duplicate (Not Complex)
	
	// Insert into DB

}

// Submission of Phone Number Form on Front-End
app.post('/signup', function(req, res) {
	
	// Check if Duplicate Phone Number
	
	// Insert into DB

});

// Submission of Message Send Form on Back-End
app.post('/send', function(req, res)) {

	// Call Twilio Library to Send

	// Insert into DB

}

var server = app.listen(3000);