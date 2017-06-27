
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

-- backup data
insert into gantt_tasks (text, start_date, duration, progress, parent) values ('「與我同行」',to_timestamp('01-01-2017','dd-mm-yyyy'),39,0.3,0);
insert into gantt_tasks (text, start_date, duration, progress, parent) values ('場地探勘',to_timestamp('14-01-2017','dd-mm-yyyy'),1,0,0);
insert into gantt_tasks (text, start_date, duration, progress, parent) values ('實驗參與者募集',to_timestamp('08-01-2017','dd-mm-yyyy'),17,0,0);
insert into gantt_tasks (text, start_date, duration, progress, parent) values ('讀字影片',to_timestamp('09-01-2017','dd-mm-yyyy'),1,100,0);
insert into gantt_tasks (text, start_date, duration, progress, parent) values ('Hours預告',to_timestamp('11-01-2017','dd-mm-yyyy'),1,100,0);
insert into gantt_tasks (text, start_date, duration, progress, parent) values ('彩虹歐都拜',to_timestamp('14-01-2017','dd-mm-yyyy'),1,0,0);
insert into gantt_tasks (text, start_date, duration, progress, parent) values ('Hours影片',to_timestamp('16-01-2017','dd-mm-yyyy'),1,0,0);
insert into gantt_tasks (text, start_date, duration, progress, parent) values ('正面鼓勵影片',to_timestamp('23-01-2017','dd-mm-yyyy'),1,0,0);
insert into gantt_tasks (text, start_date, duration, progress, parent) values ('新竹風城採訪',to_timestamp('24-02-2017','dd-mm-yyyy'),1,100,0);
insert into gantt_tasks (text, start_date, duration, progress, parent) values ('釋憲',to_timestamp('24-05-2017','dd-mm-yyyy'),1,100,0);

update gantt_tasks set parent=(select id from gantt_tasks where text='「與我同行」') where text='場地探勘';
update gantt_tasks set parent=(select id from gantt_tasks where text='「與我同行」') where text='實驗參與者募集';
