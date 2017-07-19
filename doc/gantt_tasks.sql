
CREATE TABLE gantt_tasks (
	id serial NOT NULL,
	text varchar(255) NOT NULL,
	start_date timestamp NOT NULL,
	duration integer NOT NULL DEFAULT 0,
	progress float NOT NULL DEFAULT 0,
	sortorder integer NOT NULL DEFAULT 0,
	parent integer NOT NULL,
	PRIMARY KEY (id)
);

