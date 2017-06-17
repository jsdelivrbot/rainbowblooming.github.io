var express = require('express');
var app = express();
var favicon = require('serve-favicon');
var pg = require('pg');

pg.defaults.ssl = true;
pg.connect(process.env.DATABASE_URL, function(err, client) {
	if (err) throw err;
	console.log('Connected to postgres! Getting schemas...');

	client
		.query('SELECT table_schema, table_name FROM information_schema.tables;')
		.on('row', function(row){
			console.log(JSON.stringify(row));
		})
}

app.use(favicon(__dirname + '/public/images/favicon.ico'));
app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.set('view engine', 'pug');

app.get('/', function(request, response) {
	response.render('index');
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


