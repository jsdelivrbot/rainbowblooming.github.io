var express = require('express');
var app = express();
var favicon = require('serve-favicon');

var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
	clientID: '712853165091-ddk7io2fnhhd3h0g82vr6hrashunt9bt.apps.googleusercontent.com',
	clientSecret: 'xGBTpVTqZJRTU9HhxjVlrDCa',
	callbackURL: "https://rainbowblooming.herokuapp.com//auth/google/callback"
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

app.use(express.static(__dirname + '/public'));

app.get('/', function(request, response) {
	response.render('login');
});

app.get('/index', function(request, response) {
	response.render('index');
});

// use google authentication

app.get('/auth/google',
	passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.profile.emails.read'] }));

app.get('/auth/google/callback', 
	passport.authenticate('google', { failureRedirect: '/' }),
	function(req, res) {
		// Successful authentication, redirect home.
		res.redirect('/index');
});

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.set('view engine', 'pug');

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


