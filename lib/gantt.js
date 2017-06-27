var express = require('express');
var app = express();
var pg = require('pg');

var bodyParser = require('body-parser');
require("date-format-lite");

app.use(bodyParser.urlencoded({ extended: true }));

const db = new pg.Pool(process.env.DATABASE_URL);

// dhtmlxgantt
app.get("/data", function (req, res) {
	console.log('開始查詢. ');
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

