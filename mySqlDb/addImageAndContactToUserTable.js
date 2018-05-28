var db = require('./db.js');

db.connect(function(err) {
  if (err) throw err;
  console.log("Creating user table...");
  db.query("ALTER TABLE users ADD COLUMN user_image VARCHAR(255) AFTER password, ADD COLUMN contact VARCHAR(255) AFTER user_image", function (err, result) {
    if (err) throw err;
    console.log("Table created");
  });
});