const express = require('express');
const router = express.Router();

//

const mysql = require('../services/mysql.js');

//

router.post('/', (req, res) => {

    if (req.userId == undefined) {
        res.status(500).json({ respuesta: 'err_user' });
        return;
    }

    mysql.query('INSERT INTO usuarios_denuncias (usuarioID, reportadoID, mensaje, insultos, estafa, suplantar) VALUES (?)',
        [
            [
                req.userId,
                req.body.denunciadoId,
                req.body.mensaje,
                req.body.insultar == false ? null : 1,
                req.body.estafar == false ? null : 1,
                req.body.suplantar == false ? null : 1,
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