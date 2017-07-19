
CREATE TABLE account (
	sn serial NOT NULL,
	id varchar(255) NOT NULL,
	email varchar(255) NOT NULL,
	upd_sn integer NOT NULL,
	upd_date timestamp NOT NULL,
	PRIMARY KEY (sn)
);

