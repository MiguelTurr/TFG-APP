const express = require('express');
const server = express();
const mysql = require("./mysql_module.js");

//

server.use(express.json({limit: '50mb'}));
server.use(express.urlencoded({ extended: true, limit: '50mb' }));

server.use(express.json());

//

const hostname = 'localhost';
const port = 8000;

//

server.listen(port, function() {
    console.log(`El servidor se está ejecutando en http://${hostname}:${port}/`);
});

//

server.get('/prueba', (req, res) => {

    res.json( { 
        "usuarios": 
            [ 
                {
                    nombre: 'usuario1', 
                    url: 'https://a0.muscache.com/im/pictures/eda1a9aa-13e1-48b1-b54b-b48cfdf4bb00.jpg?im_w=960'
                },
                {
                    nombre: 'usuario2',
                    url: 'https://a0.muscache.com/im/pictures/eda1a9aa-13e1-48b1-b54b-b48cfdf4bb00.jpg?im_w=960'
                },
                {
                    nombre: 'usuario3',
                    url: 'https://a0.muscache.com/im/pictures/eda1a9aa-13e1-48b1-b54b-b48cfdf4bb00.jpg?im_w=960'
                },
                {
                    nombre: 'usuario4',
                    url: 'https://a0.muscache.com/im/pictures/eda1a9aa-13e1-48b1-b54b-b48cfdf4bb00.jpg?im_w=960'
                },
                {
                    nombre: 'usuario5',
                    url: 'https://a0.muscache.com/im/pictures/eda1a9aa-13e1-48b1-b54b-b48cfdf4bb00.jpg?im_w=960'
                },
                {
                    nombre: 'usuario6',
                    url: 'https://a0.muscache.com/im/pictures/eda1a9aa-13e1-48b1-b54b-b48cfdf4bb00.jpg?im_w=960'
                },
                {
                    nombre: 'usuario7',
                    url: 'https://a0.muscache.com/im/pictures/eda1a9aa-13e1-48b1-b54b-b48cfdf4bb00.jpg?im_w=960'
                },
                {
                    nombre: 'usuario8',
                    url: 'https://a0.muscache.com/im/pictures/eda1a9aa-13e1-48b1-b54b-b48cfdf4bb00.jpg?im_w=960'
                }
            ]
        });
});

server.post('/registrar', (req, res) => {

    console.log(req.body);

    res.json({ prueba: 'ss' });
});

server.post('/login', (req, res) => {

});

server.post('/validar', (req, res) => {

});