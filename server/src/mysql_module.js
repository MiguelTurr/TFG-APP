const mysql = require('mysql');

var connection = mysql.createConnection({
    host     : 'localhost',
    port     : 3306,
    user     : 'root',
    password : 'admin',
    database : 'app'
});

connection.connect(function(err) {
    if(err) {
      console.log("[ERROR] Ha ocurrido un problema al intentar conectar con la base de datos.");
      console.log(err.message);
      return;
    }
   
    console.log('[OK] MYSQL');
});


module.exports = connection;