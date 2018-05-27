var db = require('./db.js');

db.connect(function(err) {
  if (err) throw err;
  console.log("Creating user table...");
  db.query("ALTER TABLE users ADD COLUMN password VARCHAR(255) AFTER address", function (err, result) {
    if (err) throw err;
    console.log("Table created");
  });
});