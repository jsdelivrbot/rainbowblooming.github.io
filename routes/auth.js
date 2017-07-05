
var express = require('express');
var app = express();
var router = express.Router();

passport.use(new GoogleStrategy({
	clientID: process.env.clientID,
	clientSecret: process.env.clientSecret,
	callbackURL: "https://rainbowblooming.herokuapp.com/auth/google/callback"
	},
	function(accessToken, refreshToken, profile, done) {
		console.log();
	//	User.findOrCreate({ googleId: profile.id }, function (err, user) {
	//		return done(err, user);
	//	});
	}
));

// use google authentication
app.get('/auth/google',
	passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.profile.emails.read'] })
);

// 成功登入後
app.get('/auth/google/callback', 
	passport.authenticate('google', { failureRedirect: '/' }),
	function(req, res) {
		console.log('成功登入!');
		// Successful authentication, redirect home.
		res.redirect('/index');
	}
);

module.exports = router;
