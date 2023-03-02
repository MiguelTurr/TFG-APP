const express = require('express');
const router = express.Router();

//

const mysql = require('../services/mysql.js');

//

router.get('/', (req, res) => {

    if (req.userId == undefined) return res.status(500).json({ respuesta: 'err_user' });
    if (req.userRol == undefined || req.userRol == 'Usuario') return res.status(500).json({ respuesta: 'err_rol' });

    mysql.query(
        `SELECT rep.*,CONCAT(usu.nombre," ",usu.apellidos) AS userNombre,CONCAT(usure.nombre," ",usure.apellidos) AS reportedNombre FROM usuarios_denuncias as rep
        INNER JOIN usuarios AS usu ON rep.usuarioID=usu.ID
        INNER JOIN usuarios AS usure ON rep.reportadoID=usure.ID
        ORDER BY rep.creadoEn DESC`, req.userId, (err, result) => {
            
        if(err) {
            res.status(500).json({ respuesta: 'err_db' });
            console.log(err.message);
            return;
        }

        res.status(200).json({ respuesta: 'correcta', reportes: result });
    });
});

module.exports = router