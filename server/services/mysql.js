const mysql = require('mysql');
const { mysql_host, mysql_user, mysql_password, mysql_database } = require('./config.js');

//

var connection = mysql.createConnection({
    host     : mysql_host,
    port     : 3306,
    user     : mysql_user,
    password : mysql_password,
    database : mysql_database,
    charset : 'utf8mb4'
});

connection.connect(function(err) {
    if(err) {
      console.log("[ERROR] Ha ocurrido un problema al intentar conectar con la base de datos.");
      console.log(err.message);
      return;
    }

    /*connection.query('SHOW TABLES', function(err, result) {
      console.log(result);
    });*/
   
    console.log('[OK] MYSQL');
});

module.exports = connection;