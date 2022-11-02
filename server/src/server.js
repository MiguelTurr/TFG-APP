const express = require('express');
const server = express();
const mysql = require("./mysql_module.js");

//

const hostname = 'localhost';
const port = 8000;

//

server.listen(port, function() {
    console.log(`El servidor se está ejecutando en http://${hostname}:${port}/`);
});

//

server.get('/prueba', (req, res) => {
    res.json( { "usuarios": [ 'usuario1', 'usuario2', 'usuario3' ] });
});