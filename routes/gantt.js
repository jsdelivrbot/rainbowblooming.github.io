var express = require('express');
var router = express.Router();

require("date-format-lite");

var pg = require('pg');
pg.defaults.ssl = (process.env.NODE_ENV=='true');
//pg.defaults.ssl = false;
console.log('變數: '+process.env.NODE_ENV);
// 待刪除
var db;

router.get("/", function (req, res, next) {
	pg.connect(process.env.DATABASE_URL, function(err, client) {
		if (err) {
			console.log(err);
		} else {
			console.log('Connected to postgres! Getting schemas...');
	
			client.query('SELECT * FROM gantt_tasks', function (err, result_tasks, done) {
				if (err) {
					console.log(err);
				} else {
					client.query("SELECT * FROM gantt_links", function (err, result_links) {
						if (err) {
							console.log(err);
						} else {
							// query rows
							var rows = result_tasks.rows;
							var links = result_links.rows;
							for (var i = 0; i < rows.length; i++) {
								// rows[i].start_date = rows[i].start_date.format("YYYY-MM-DDThh:mm:ss");
								// 直接將 timestamp 轉成 YYYY-MM-DD
								rows[i].start_date = rows[i].start_date.date("DD-MM-YYYY");
								rows[i].open = true;
							}
	
							res.send({ data: rows, collections: { links: links } });
						}
					});
				}
			})	
		}
	});
});

// dhtmlxgantt
//router.get("/", function (req, res, next) {
//	db.query("SELECT * FROM gantt_tasks", function (err, result_tasks, done) {
//		if (err) console.log(err);
//		db.query("SELECT * FROM gantt_links", function (err, result_links) {
//			//done();
//			if (err) console.log(err);
//			// query rows
//			var rows = result_tasks.rows;
//			var links = result_links.rows;
//			for (var i = 0; i < rows.length; i++) {
//				// rows[i].start_date = rows[i].start_date.format("YYYY-MM-DDThh:mm:ss");
//				// 直接將 timestamp 轉成 YYYY-MM-DD
//				rows[i].start_date = rows[i].start_date.date("DD-MM-YYYY");
//				rows[i].open = true;
//			}
//
//			res.send({ data: rows, collections: { links: links } });
//		});
//	});
//});

router.post("/task", function (req, res, next) {
	var task = getTask(req.body);

	db.query("INSERT INTO gantt_tasks(text, start_date, duration, progress, parent) VALUES ($1,$2,$3,$4,$5)",
		[task.text, task.start_date, task.duration, task.progress, task.parent],
		function (err, result) {
			sendResponse(res, "inserted", result ? result.insertId : null, err);
		});
});

router.put("/task/:id", function (req, res, next) {
	var sid = req.params.id,
		task = getTask(req.body);


	db.query("UPDATE gantt_tasks SET text = $1, start_date = $2, duration = $3, progress = $4, parent = $5 WHERE id = $6",
		[task.text, task.start_date, task.duration, task.progress, task.parent, sid],
		function (err, result) {
			sendResponse(res, "updated", null, err);
		});
});

router.delete("/task/:id", function (req, res, next) {
	var sid = req.params.id;
	db.query("DELETE FROM gantt_tasks WHERE id = $1", [sid],
		function (err, result) {
			sendResponse(res, "deleted", null, err);
		});
});

router.post("/link", function (req, res, next) {
	var link = getLink(req.body);

	db.query("INSERT INTO gantt_links (source, target, type) VALUES ($1,$2,$3)",
		[link.source, link.target, link.type],
		function (err, result) {
			sendResponse(res, "inserted", result ? result.insertId : null, err);
		});
});

router.put("/link/:id", function (req, res, next) {
	var sid = req.params.id,
		link = getLink(req.body);

	db.query("UPDATE gantt_links SET source = $1, target = $2, type = $3 WHERE id = $4",
		[link.source, link.target, link.type, sid],
		function (err, result) {
			sendResponse(res, "updated", null, err);
		});
});

router.delete("/link/:id", function (req, res, next) {
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

module.exports = router;
