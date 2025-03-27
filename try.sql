insert into login (username, password) values ('admin', 'admin');
insert into login (username, password) values ('user', 'user');
insert into login (username, password) values ('guest', 'guest');

UPDATE Login
SET Name = 'Administ', Role= 'Head'
WHERE Username = 'Admin';
