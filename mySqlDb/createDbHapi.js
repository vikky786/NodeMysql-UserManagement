var con = require('./connection.js');

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  con.query("CREATE DATABASE hapi", function (err, result) {
    if (err) throw err;
    console.log("Database created");
  });
});