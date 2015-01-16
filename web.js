var express = require('express'),
	http = require("http")
var app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

// Handle Default Route for Static Files
app.use("/", express.static(__dirname+"/static"));

// Init Body Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 

/*******************
  Database Config
*******************/

// Mongo Database Name
var DB_NAME = 't2bs-textalerts';

// Mongoose Models
var phoneSchema = mongoose.Schema({
	name: String,
	phone: String,
	date: Date
});
var messageSchema = mongoose.Schema({
	msg: String,
	date: Date
});
var suggestionSchema = mongoose.Schema({
	name: String,
	date: Date
});
var PhoneRecord = mongoose.model("PhoneRecord", phoneSchema);
var MessageRecord = mongoose.model("MessageRecord", messageSchema);
var SuggestionRecord = mongoose.model("SuggestionRecord", suggestionSchema);

// Mongo Initialiation
var db = mongoose.connection;
db.on('error', console.error);
mongoose.connect('mongodb://localhost/'+DB_NAME);


/******************
   Custom Routes
******************/

// Populate Front-End with Recent Suggestions
app.get('/suggestions', function(req, res) {

	// Get Recent Suggestions from DB
	SuggestionRecord.find(function(err, result) {
		if (err) { console.log(err); res.send("NO: 1"); return; }
		res.send(JSON.stringify(result));
	});

});


// Populates Admin Area with Stored Data
app.get('/admindata', function(req, res) {

	// Check if User is Logged In

	// Get Recent Messages from DB
	
	// Get Registered Users from DB
	 
	// Get Suggestions from DB

});

// Submission of Suggestion on Front-End
app.post('/suggest', function(req, res) {

	// Get Required Post Data
	var suggestion = req.body.suggestion;
	if (!suggestion) { res.send("NO: 1"); return; }

	// Check if Duplicate (Not Complex)
	SuggestionRecord.count({
		name: suggestion
	}, function(err, count) {

		if (err) { console.log(err); res.send("NO: 2"); return; }

		// If Record Exists, Don't Re-Add
		if (count > 0) { res.send("NO: 3"); return; }

		// Insert into DB
		var record = new SuggestionRecord({
			name: suggestion,
			date: Date.now()
		});
		record.save(function(err, r) {
			if (err) { console.log(err); res.send("NO: 2"); }
			else { res.send("OK"); }
		});

	})

});

// Submission of Phone Number Form on Front-End
app.post('/signup', function(req, res) {

	// Get Required Post Data
	var name = req.body.name;
	if (!name) { res.send("NO: 1"); return; }
	var number = req.body.number;
	if (!number) { res.send("NO: 2"); return; }
	
	// Check if Duplicate Phone Number, then Insert
	PhoneRecord.count({
		$or: [
			{ name: name }, 
			{ phone: number}
		]
	}, function(err, count) {

		if (err) { console.log(err); res.send("NO: 3"); return; }

		// If Record Exists, Don't Re-Add
		if (count > 0) { res.send("NO: 4"); return; }

		// Insert into DB
		var record = new PhoneRecord({
			name: name,
			phone: number,
			date: Date.now()
		});
		record.save(function(err, r) {
			if (err) { console.log(err); res.send("NO: 5"); }
			else { res.send("OK"); }
		});

	})

});

// Submission of Message Send Form on Admin Area
app.post('/send', function(req, res) {

	// Check Authentication
	
	// Check Required Fields

	// Call Twilio Library to Send

	// Insert into DB

});

var server = app.listen(3000);