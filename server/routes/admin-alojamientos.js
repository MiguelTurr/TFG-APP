const express = require('express');
const router = express.Router();

//

const mysql = require('../services/mysql.js');

//

router.get('/', (req, res) => {

    if (req.userId == undefined) return res.status(500).json({ respuesta: 'err_user' });
    if (req.userRol == undefined || req.userRol <= 0) return res.status(500).json({ respuesta: 'err_rol' });

    mysql.query(
        `SELECT alo.ID,alo.usuarioID,alo.ubicacion,alo.creadoEn,alo.precio,alo.valoracionMedia,alo.vecesValorado,usu.ID as userId,CONCAT(usu.nombre," ",usu.apellidos) AS userNombre
        FROM alojamientos as alo
        INNER JOIN usuarios as usu ON alo.usuarioID=usu.ID
        ORDER BY creadoEn DESC`, (err, result) => {
        if(err) {
            res.status(500).json({ respuesta: 'err_db' });
            console.log(err.message);
            return;
        }

        res.status(200).json({ respuesta: 'correcta', alojamientos: result });
    });
});

module.exports = router