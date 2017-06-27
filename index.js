// require('./lib/gantt.js');
var express = require('express');

var app = express();
var session = require('express-session')
var pgSession = require('connect-pg-simple')(session);
var favicon = require('serve-favicon');

var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth20').Strategy;

var pg = require('pg');

var bodyParser = require('body-parser');
require("date-format-lite");

app.use(bodyParser.urlencoded({ extended: true }));

const db = new pg.Pool(process.env.DATABASE_URL);

passport.use(new GoogleStrategy({
	clientID: process.env.clientID,
	clientSecret: process.env.clientSecret,
	callbackURL: "https://rainbowblooming.herokuapp.com/auth/google/callback"
	},
	function(accessToken, refreshToken, profile, cb) {
		User.findOrCreate({ googleId: profile.id }, function (err, user) {
			return cb(err, user);
		});
	}
));

// use favicon.ico
app.use(favicon(__dirname + '/public/images/favicon.ico'));
app.set('port', (process.env.PORT || 5000));
// Middleware
app.use(express.static(__dirname + '/public'));
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));
app.use(session({
	store: new pgSession({
		pool : db
	}),
	saveUninitialized: true,
	secret: process.env.FOO_COOKIE_SECRET,
	resave: false,
	cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 } // 30 days
}));
app.use(passport.initialize());
app.use(passport.session());

app.engine('pug', require('pug').__express);

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.set('view engine', 'pug');


app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

app.get('/', function(request, response) {
	response.render('login');
});

app.get('/index', function(request, response) {
	// examine if login
	
	response.render('index');
});

// use google authentication
app.get('/auth/google',
	passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.profile.emails.read'] }));

// 成功登入後
app.get('/auth/google/callback', 
	passport.authenticate('google', { failureRedirect: '/' }),
	function(req, res) {
		console.log('成功登入!');
		// Successful authentication, redirect home.
		res.redirect('/index');
	}
);

// dhtmlxgantt
app.get("/data", function (req, res) {
	db.query("SELECT * FROM gantt_tasks", function (err, result_tasks, done) {
		if (err) console.log(err);
		db.query("SELECT * FROM gantt_links", function (err, result_links) {
			//console.log('查詢的 links: '+ JSON.stringify(result_tasks));
			//done();
			if (err) console.log(err);
			// query rows
			var rows = result_tasks.rows;
			var links = result_links.rows;
			//console.log('查詢的 result_tasks.rows: '+ JSON.stringify(result_tasks.rows));
			for (var i = 0; i < rows.length; i++) {
				//console.log('row_'+i+ JSON.stringify(rows[i]));
				// rows[i].start_date = rows[i].start_date.format("YYYY-MM-DDThh:mm:ss");
				// 直接將 timestamp 轉成 YYYY-MM-DD
				rows[i].start_date = rows[i].start_date.date("DD-MM-YYYY");
				rows[i].open = true;
			}

			res.send({ data: rows, collections: { links: links } });
		});
	});
});

app.post("/data/task", function (req, res) {
	var task = getTask(req.body);

	db.query("INSERT INTO gantt_tasks(text, start_date, duration, progress, parent) VALUES ($1,$2,$3,$4,$5)",
		[task.text, task.start_date, task.duration, task.progress, task.parent],
		function (err, result) {
			sendResponse(res, "inserted", result ? result.insertId : null, err);
		});
});

app.put("/data/task/:id", function (req, res) {
	var sid = req.params.id,
		task = getTask(req.body);


	db.query("UPDATE gantt_tasks SET text = $1, start_date = $2, duration = $3, progress = $4, parent = $5 WHERE id = $6",
		[task.text, task.start_date, task.duration, task.progress, task.parent, sid],
		function (err, result) {
			sendResponse(res, "updated", null, err);
		});
});

app.delete("/data/task/:id", function (req, res) {
	var sid = req.params.id;
	db.query("DELETE FROM gantt_tasks WHERE id = $1", [sid],
		function (err, result) {
			sendResponse(res, "deleted", null, err);
		});
});

app.post("/data/link", function (req, res) {
	var link = getLink(req.body);

	db.query("INSERT INTO gantt_links (source, target, type) VALUES ($1,$2,$3)",
		[link.source, link.target, link.type],
		function (err, result) {
			sendResponse(res, "inserted", result ? result.insertId : null, err);
		});
});

app.put("/data/link/:id", function (req, res) {
	var sid = req.params.id,
		link = getLink(req.body);

	db.query("UPDATE gantt_links SET source = $1, target = $2, type = $3 WHERE id = $4",
		[link.source, link.target, link.type, sid],
		function (err, result) {
			sendResponse(res, "updated", null, err);
		});
});

app.delete("/data/link/:id", function (req, res) {
	var sid = req.params.id;
	db.query("DELETE FROM gantt_links WHERE id = $1", [sid],
		function (err, result) {
			sendResponse(res, "deleted", null, err);
		});
});

function getTask(data) {
	return {
		text: data.text,
		start_date: data.start_date.date("YYYY-MM-DD"),
		duration: data.duration,
		progress: data.progress || 0,
		parent: data.parent
	};
}

function getLink(data) {
	return {
		source: data.source,
		target: data.target,
		type: data.type
	};
}

function sendResponse(res, action, tid, error) {
	if (error) {
		console.log(error);
		action = "error";
	}

	var result = {
		action: action
	};
	if (tid !== undefined && tid !== null)
		result.tid = tid;

	res.send(result);
}


