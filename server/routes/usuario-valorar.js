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

    mysql.query('INSERT INTO usuarios_valoraciones (usuarioID, userValoradoID, tipo, mensaje) VALUES (?)', 
    [
        [
            req.userId,
            req.body.usuarioID,
            req.body.tipo,
            req.body.mensaje,
        ]
    ], function(err, result) {

        if (err) {
            res.status(500).json({ respuesta: 'err_db' });
            console.log(err.message);
            return;
        }

        // ACTUALIZAR RESERVA

        var valoracionId = result.insertId;
        mysql.query('UPDATE usuarios_reservas SET valoraHospedador=? WHERE ID=?', [valoracionId, req.body.reservaID]);

        //

        res.status(200).json({ respuesta: 'correcto', userValoracion: valoracionId });
    });
});

module.exports = router