const express = require('express');
const router = express.Router();

//

const mysql = require('../services/mysql.js');

//

router.get('/ver/:id', (req, res) => {

    const userId = req.params.id;

    mysql.query('SELECT nombre,apellidos,presentacion,residencia,trabajo,idiomas,fechaReg FROM usuarios WHERE ID=? LIMIT 1', userId, function (err, result) {

        if (err) {
            res.status(500).json({ respuesta: 'err_db' });
            console.log(err.message);
            return;
        }

        if (result.length == 0) {
            res.status(401).json({ respuesta: 'err_datos' });
            return;
        }

        res.status(200).json({ respuesta: 'correcto', user: result });
    });
});

router.get('/alojamientos/:id', (req, res) => {

    const userId = req.params.id;

    mysql.query('SELECT ID,valoracionMedia,vecesValorado,ubicacion FROM alojamientos WHERE usuarioID=? ORDER BY creadoEn DESC', userId, function (err, result) {
        if (err) {
            res.status(500).json({ respuesta: 'err_db' });
            console.log(err.message);
            return;
        }

        res.status(200).json({ respuesta: 'correcto', alojamientos: result });
    });
});

router.get('/alojamientos/valoraciones/:id', (req, res) => {

    const userId = req.params.id;

    mysql.query(`SELECT val.creadaEn,val.mensaje,alo.ID as alojamientoId,alo.ubicacion,usu.ID as usuarioId,usu.nombre,usu.residencia,usu.fechaReg FROM alojamientos as alo
        INNER JOIN alojamientos_valoraciones as val ON val.alojamientoID=alo.ID
        INNER JOIN usuarios as usu ON val.usuarioID=usu.ID 
        WHERE alo.usuarioID=? ORDER BY val.creadaEn DESC`, userId,

        function (err, result) {
            if (err) {
                res.status(500).json({ respuesta: 'err_db' });
                console.log(err.message);
                return;
            }

            res.status(200).json({ respuesta: 'correcto', valoraciones: result });
        }
    );
});

router.get('/valoraciones/:id', (req, res) => {

    const userId = req.params.id;

    mysql.query(`SELECT val.creadoEn,val.mensaje,usu.ID as usuarioId,usu.nombre,usu.residencia,usu.fechaReg FROM usuarios_valoraciones as val 
        INNER JOIN usuarios as usu ON val.usuarioID=usu.ID
        WHERE val.userValoradoID=? ORDER BY val.creadoEn DESC`, userId,
        function (err, result) {

            if (err) {
                res.status(500).json({ respuesta: 'err_db' });
                console.log(err.message);
                return;
            }

            res.status(200).json({ respuesta: 'correcto', valoraciones: result });
        }
    );
});

module.exports = router