// require('./lib/gantt.js');
var express = require('express');
var app = express();

var session = require('express-session')
var pgSession = require('connect-pg-simple')(session);
var favicon = require('serve-favicon');

var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth20').Strategy;
// 測試
// var LocalStrategy = require('passport-local').Strategy;

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

var pg = require('pg');
const db = new pg.Pool(process.env.DATABASE_URL);

// dhtmlxGantt router
var gantt = require('./routes/gantt');
app.use('/data', gantt);

// use favicon.ico
app.use(favicon(__dirname + '/public/images/favicon.ico'));
app.set('port', (process.env.PORT || 5000));
// Middleware
app.use(express.static(__dirname + '/public'));

app.engine('pug', require('pug').__express);

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.set('view engine', 'pug');

// 使用者認證
var Account = require('./routes/account');

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

// the sessiion thing must before req.isAuthenticated() etc....
app.use(session({
	store: new pgSession({
		conString: process.env.DATABASE_URL
	}),
	saveUninitialized: true,
	secret: process.env.FOO_COOKIE_SECRET,
	resave: false,
	cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 } // 30 days
}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/', function(request, response) {
	response.render('login');
});

app.get('/index', checkLogin, function(request, response) {
	response.render('index');
});

// 檢查是否登入
function checkLogin(req, res, next) {
	if (req.isAuthenticated()) {
		next();
	} else {
		res.redirect('/login');
	}
}

passport.use(new GoogleStrategy({
	clientID: process.env.clientID,
	clientSecret: process.env.clientSecret,
	callbackURL: "https://rainbowblooming.herokuapp.com/auth/google/callback"
	},
	function(accessToken, refreshToken, profile, done) {
		console.log('成功得到 accessToken: '+accessToken);
		console.log('成功得到 refreshToken: '+refreshToken);
		console.log('成功得到 profile: '+profile);
		console.log('成功得到 JSON.stringify(profile): '+JSON.stringify(profile));
		done(null, profile.id);
	//	User.find({ googleId: profile.id }, function (err, user) {
	//		return done(err, user);
	//	});
	}
));

// 測試 LocalStrategy
//passport.use(new LocalStrategy(
//  function(username, password, done) {
//  	  console.log('驗證結果: '+ Account.find(username));
//   // console.log('輸入的 username: '+username);
//   // console.log('輸入的 password: '+password);
//   // User.findOne({ username: username }, function (err, user) {
//   // if (err) { return done(err); }
//   //   if (!user) {
//   //     return done(null, false, { message: 'Incorrect username.' });
//   //   }
//   //   if (!user.validPassword(password)) {
//   //     return done(null, false, { message: 'Incorrect password.' });
//   //   }
//      return done(null, username);
//   // });
//  }
//));

passport.serializeUser(function(user, done) {
	done(null, user);
});

passport.deserializeUser(function(id, done) {
	//User.findById(id, function(err, user) {
		done(null, id);
	//});
});

app.all('/login',
	passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.profile.emails.read'],
									successRedirect: '/index',
									failureRedirect: '/',
									failureFlash: false 
	})
);

// use google authentication
//app.get('/auth/google',
//	passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.profile.emails.read'],
//										successRedirect: '/index',
//										failureRedirect: '/',
//										failureFlash: false 
//	})
//);

// 成功登入後
app.get('/auth/google/callback', 
	passport.authenticate('google', { failureRedirect: '/' }),
	function(req, res) {
		console.log('成功登入!');
		// Successful authentication, redirect home.
		res.redirect('/index');
	}
);

