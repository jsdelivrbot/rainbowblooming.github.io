
CREATE TABLE gantt_links (
	id serial NOT NULL,
	source integer NOT NULL,
	target integer NOT NULL,
	type varchar(1) NOT NULL,
	PRIMARY KEY (id)
);
