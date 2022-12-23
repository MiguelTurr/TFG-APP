const express = require('express');
const router = express.Router();

//

const mysql = require('../services/mysql.js');

//

router.post('/resultado', (req, res) => {

    var queryStr = 'SELECT * FROM alojamientos WHERE ';

    // FILTROS

    const filtros = req.body.filtros;

    if(filtros.precio_min !== null) {
        queryStr += 'precio BETWEEN ' +parseInt(filtros.precio_min)+ ' AND ' +parseInt(filtros.precio_max)+ ' ';
    }

    if(filtros.viajeros !== null) {
        queryStr += 'AND viajeros>=' +parseInt(filtros.viajeros)+ ' ';
    }

    if(filtros.habitaciones !== null) {
        queryStr += 'AND habitaciones>=' +parseInt(filtros.habitaciones)+ ' ';
    }

    if(filtros.camas !== null) {
        queryStr += 'AND camas>=' +parseInt(filtros.camas)+ ' ';
    }

    if(filtros.aseos !== null) {
        queryStr += 'AND aseos>=' +parseInt(filtros.aseos)+ ' ';
    }

    // VALORACION

    if(filtros.valoracion !== null && filtros.valoracion > 0) {
        queryStr += 'AND valoracionMedia>' +parseInt(filtros.valoracion)+ ' ';
    }  

    //

    mysql.query(queryStr, function(err, result) {
        res.status(200).json({ respuesta: 'correcto', cantidad: result === undefined ? 0 : result.length });
    });
});

module.exports = router