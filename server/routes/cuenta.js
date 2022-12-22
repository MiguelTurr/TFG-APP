const express = require('express');
const router = express.Router();

const mysql = require('../services/mysql');




router.post('/logout', (_, res) => {
    res.status(200).clearCookie("token");
    res.end();
});

router.post('/denunciar', (req, res) => {

    if (req.userId == undefined) {
        res.status(500).json({ respuesta: 'err_user' });
        return;
    }

    mysql.query('INSERT INTO usuarios_denuncias (usuarioID, reportadoID, mensaje) VALUES (?)',
        [
            [
                req.userId,
                req.body.denunciadoId,
                req.body.mensaje,
            ]
        ], function (err) {

            if (err) {
                res.status(500).json({ respuesta: 'err_db' });

                console.log(err.message);
                return;
            }

            res.status(200).json({ respuesta: 'correcto' });
        });
});

module.exports = router