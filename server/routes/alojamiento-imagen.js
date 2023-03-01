const express = require('express');
const router = express.Router();

//

const mysql = require('../services/mysql.js');
const fs = require("fs");

//

router.get('/:id', (req, res) => {

    const [id, index] = req.params.id.split('-');

    mysql.query("SELECT nombre FROM alojamientos_img WHERE alojamientoID=? LIMIT ?, 1", [id, parseInt(index)], (err, result) => {

        if (err) {
            res.status(500).json({ respuesta: 'err_db' });
            console.log(err.message);
            return;
        }

        if (result.length === 0) {
            res.status(500).json({ respuesta: 'err_db' });
            return;
        }

        fs.readFile('./imagenes/casas/' +result[0].nombre, function (err, file) {

            if (err) {
                res.status(500).json({ respuesta: 'err_file' });
                return;
            }

            res.set({ 'Content-Type': 'image/*' });
            res.end(file);
        });
    });
});


router.get('/hospedador/:id', (req, res) => {

    const hospedadorId = req.params.id;

    mysql.query("SELECT imgPerfil FROM usuarios WHERE ID=? LIMIT 1", hospedadorId, (err, result) => {

        if (err) {
            res.status(500).json({ respuesta: 'err_db' });
            console.log(err.message);
            return;
        }

        const imagen = result[0].imgPerfil;

        fs.readFile('./imagenes/perfil/' + imagen, function (err, file) {

            if (err) {
                res.status(500).json({ respuesta: 'err_file' });
                return;
            }

            res.set({ 'Content-Type': 'image/jpg' });
            res.end(file);
        });
    });
});

module.exports = router