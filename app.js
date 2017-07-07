// require('./lib/gantt.js');
var express = require('express');
var app = express();

var session = require('express-session')
var pgSession = require('connect-pg-simple')(session);
var favicon = require('serve-favicon');

var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth20').Strategy;
// 測試
//var LocalStrategy = require('passport-local').Strategy;

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
	console.log('檢查是否登入 req.isAuthenticated(): '+req.isAuthenticated());
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
		console.log('成功得到 profile.emails[0].value: '+profile.emails[0].value);
		var email = '';
		var session_user = '';
		try {
			email = profile.emails[0].value;
			session_user = profile.id;
			console.log('mail = '+email +'; profile.id = '+session_user)
			if(Account.find(profile.emails[0].value)){
				return done(null, session_user);
			} else {
	    	    return done(null, false, { message: '帳號沒有權限.' });
			}
		} catch (err) {
			console.log('err from : '+err);
			return done(null, false, { message: '錯誤發生.' });
		}
	}
));

// 測試 LocalStrategy
//passport.use(new LocalStrategy(
//  function(username, password, done) {
//  	  console.log('驗證結果: '+ Account.find(username));
//   // User.findOne({ username: username }, function (err, user) {
//   // if (err) { return done(err); }
//   //   if (!user) {
//   //     return done(null, false, { message: 'Incorrect username.' });
//   //   }
//   //   if (!user.validPassword(password)) {
//		if(Accoutn.find(username)){
//			return done(null, username);
//		} else {
//	        return done(null, false, { message: 'Incorrect password.' });
//		}
//   // });
//  }
//));

passport.serializeUser(function(user, done) {
	done(null, user);
});

passport.deserializeUser(function(user, done) {
	//User.findById(id, function(err, user) {
		done(null, user);
	//});
});

app.all('/login',
	passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.profile.emails.read']
	//passport.authenticate('local', { 
//									,successRedirect: '/index',
//									failureRedirect: '/',
//									failureFlash: false 
	})
);

// 成功登入後
app.all('/auth/google/callback', 
	passport.authenticate('google', { failureRedirect: '/' }),
	function(req, res) {
		console.log('成功登入!');
		// Successful authentication, redirect home.
		res.redirect('/index');
	}
);

