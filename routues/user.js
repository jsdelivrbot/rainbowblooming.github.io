
var express = require('express');
var app = express();
var router = express.Router();
var pg = require('pg');

function find({ googleId: profile.id }, function (err, user) {
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

module.exports = router;
