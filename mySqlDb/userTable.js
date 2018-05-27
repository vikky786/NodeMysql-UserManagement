var db = require('./db.js');

db.connect(function(err) {
  if (err) throw err;
  console.log("Creating user table...");
  db.query("CREATE TABLE users (id int(6) unsigned auto_increment primary key, name VARCHAR(255), email varchar(255), address VARCHAR(255))", function (err, result) {
    if (err) throw err;
    console.log("Table created");
  });
});