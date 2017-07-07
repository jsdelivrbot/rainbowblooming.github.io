var express = require('express');
var router = express.Router();

var pg = require('pg');
pg.defaults.ssl = (process.env.PG_SSL=='true');

//function find({ googleId: profile.id }, function (err, user) {
router.find = function (email) {
	var result = false;
	pg.connect(process.env.DATABASE_URL, function(err, client) {
		if (err) {
			console.log(err);
		} else {
			client.query("SELECT * FROM account where email=$1", 
				[email],
				function (err, result) {
					if (err) {
						console.log(err);
					} else {
						console.log('驗證查詢: result.rows = '+result.rows);
						console.log('驗證查詢: JSON.stringify(result.rows) = '+JSON.stringify(result.rows));
						if(result.rows) {
							console.log('有查到使用者');
							result = true;
						}
					}
					
					return result;
				}
			);
		//	client.query("SELECT * FROM account where email=$1", [email]).on('rows', function(rows) { 
		//			console.log('驗證查詢: rows = '+rows);
		//			console.log('驗證查詢: JSON.stringify(rows) = '+JSON.stringify(rows));
		//			if(rows) {
		//				return true;
		//			} else {
		//				return false;
		//			}
		//		}
		//	);
		}
	});
	return result;
}

module.exports = router;
