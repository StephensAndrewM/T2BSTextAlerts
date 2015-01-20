var express = require('express'),
	http = require("http")
var app = express();
var bodyParser = require('body-parser');

var mongoose = require('mongoose');

var keys = require('./keys')
var twilio = require('twilio')(keys.twilio_account_sid, keys.twilio_auth_token);


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

var makeError = function(msg) {
	var result = { error:msg };
	return JSON.stringify(result);
}

var Error = {
	general: function(res, msg) {
		result = { error:msg };
		Error.send(res, result);
	},
	missing: function(res, field) {
		result = { error:"Required field not provided.", name:field };
		Error.send(res, result);
	},
	db: function(res) {
		Error.general(res, "A database error occurred.");
	}
	send: function(res, json) {
		res.send(JSON.stringify(json));
	}
}

// Populate Front-End with Recent Suggestions
app.get('/suggestions', function(req, res) {

	// Get Recent Suggestions from DB
	SuggestionRecord.find({}, function(err, result) {
		if (err) { 
			Error.general(res, "Could not retrieve suggestions.");
		} else {
			res.send(JSON.stringify(result));
		}
	});

});


// Populates Admin Area with Stored Data
app.get('/admindata', function(req, res) {

	// Aggregate Combined Request
	var allResponse = {
		messages: false,
		users: false,
		suggestions: false
	}

	var dbHandler = function(slot) {
		return function(err, result) {
			allResponse[slot] = result;

			if (allResponse.messages !== false &&
				allResponse.users !== false &&
				allResponse.suggestions !== false) {
				res.send(JSON.stringify(allResponse));
			}
		}
	}

	// Authenticate
	// TODO

	// Get Recent Messages from DB
	MessageRecord.find({}, dbHandler("messages"));
	
	// Get Registered Users from DB
	PhoneRecord.find({}, dbHandler("users"));
	 
	// Get Suggestions from DB
	SuggestionRecord.find({}, dbHandler("suggestions"));

});

// Submission of Suggestion on Front-End
app.post('/suggest', function(req, res) {

	// Get Required Post Data
	var suggestion = req.body.suggestion;
	if (!suggestion) { 
		Error.missing(res, "suggestion");
		return; 
	}

	// Check if Duplicate (Not Complex)
	SuggestionRecord.count({
		name: suggestion
	}, function(err, count) {

		if (err) { 
			Error.db(res);
			return;
		}

		// If Record Exists, Don't Re-Add
		if (count > 0) { 
			Error.general("This has already been suggested.");
			return;
		}

		// Insert into DB
		var record = new SuggestionRecord({
			name: suggestion,
			date: Date.now()
		});
		record.save(function(err, r) {
			if (err) { Error.db(res); }
			else { res.send("OK"); }
		});

	})

});

// Submission of Phone Number Form on Front-End
app.post('/signup', function(req, res) {

	// Get Required Post Data
	var name = req.body.name;
	if (!name) { 
		Error.missing(res, "name");
		return; 
	}
	var number = req.body.number;
	if (!number) { 
		Error.missing(res, "number");
		return; 
	}

	// Put Phone Number in Required Format
	// TODO
	
	// Check if Duplicate Phone Number, then Insert
	PhoneRecord.count({
		$or: [
			{ name: name }, 
			{ phone: number}
		]
	}, function(err, count) {

		if (err) { 
			Error.db(res);
			return; 
		}

		// If Record Exists, Don't Re-Add
		if (count > 0) { 
			Error.general("This person is already signed up for text alerts.");
			return;
		}

		// Insert into DB
		var record = new PhoneRecord({
			name: name,
			phone: number,
			date: Date.now()
		});
		record.save(function(err, r) {
			if (err) { Error.db(res); }
			else { res.send("OK"); }
		});

	})

});

// Submission of Message Send Form on Admin Area
app.post('/send', function(req, res) {

	// Authenticate
	// TODO
	
	// Check Required Fields
	var message = req.body.message;
	if (!message) { Error.missing("message"); return; }

	// Count Interactions for End of Request
	var resultSuccess = true;
	var resultCount = 0;

	PhoneRecord.find({}, function(err, dbResult) {

		// Checks How Many Requests Have Happened
		// Send Response if We Have Hit the Right Number
		var endCheck = function() {
			if (resultCount == dbResult.length) {
				if (resultSuccess) { res.send("OK"); } 
				else { Error.general("An error occurred while sending messages."); }
			}
		}

		for(var i in dbResult) {
			var row = dbResult[i];

			// Send One Text for Every Number in Database
			twilio.sendMessage({

			    to: row.phone,
			    from: '+16176074800',
			    body: message

			}, function(err, responseData) {

				// Increment Result Count Either Way
				resultCount++;

			    if (!err) {

			        // Insert into DB
					var record = new MessageRecord({
						msg: message,
						date: Date.now()
					});
					record.save(function(err, r) {
						if (err) { resultSuccess = false; }
						endCheck();
					});

			    } else {

			    	// Something Went Wrong; Stop Everything
			    	resultSuccess = false;
			    	endCheck();
			    	return;

			    }


			});

		}

	})

});


app.post('/response', function(req, res) {



});

var server = app.listen(3000);