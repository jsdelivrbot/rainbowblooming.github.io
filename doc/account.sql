
CREATE TABLE account (
	sn serial NOT NULL,
	id varchar(255) NOT NULL,
	email varchar(255) NOT NULL,
	upd_sn integer NOT NULL,
	upd_date timestamp NOT NULL,
	PRIMARY KEY (sn)
);

-- backup data
insert into account (id, email, upd_sn, upd_date) values ('hao', 'hao.wu1980@gmail.com', 1, now());
