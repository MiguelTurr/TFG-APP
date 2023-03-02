const express = require('express');
const router = express.Router();

//

const mysql = require('../services/mysql.js');

//

router.get('/', (req, res) => {

    if (req.userId == undefined) return res.status(500).json({ respuesta: 'err_user' });
    if (req.userRol == undefined || req.userRol == 'Usuario') return res.status(500).json({ respuesta: 'err_rol' });

    mysql.query('SELECT ID,estado,email,ultimaConexion,rol,CONCAT(nombre," ",apellidos) as nombre FROM usuarios WHERE ID!=? ORDER BY fechaReg DESC', req.userId, (err, result) => {
        if(err) {
            res.status(500).json({ respuesta: 'err_db' });
            console.log(err.message);
            return;
        }

        res.status(200).json({ respuesta: 'correcta', usuarios: result });
    });
});

router.post('/editar', (req, res) => {

    if (req.userId == undefined) return res.status(500).json({ respuesta: 'err_user' });
    if (req.userRol == undefined || req.userRol == 'Usuario') return res.status(500).json({ respuesta: 'err_rol' });

    var queryStr = 'UPDATE usuarios SET ';

    if(req.body.opcion === 'verificar') {
        queryStr += 'estado="Activa" ';

    } else if(req.body.opcion === 'ban') {
        queryStr += 'estado="Bloqueada" ';

    } else if(req.body.opcion === 'desban') {
        queryStr += 'estado="Activa" ';

    } else if(req.body.opcion === 'dar_admin') {
        if (req.userRol != 'Owner') return res.status(500).json({ respuesta: 'err_super' });
        queryStr += 'rol="Admin" ';

    } else if(req.body.opcion === 'quitar_admin') {
        if (req.userRol != 'Owner') return res.status(500).json({ respuesta: 'err_super' });
        queryStr += 'rol="Usuario" ';
    }

    queryStr += 'WHERE ID=' +req.body.userId+ ' LIMIT 1';

    mysql.query(queryStr, (err) => {
        if(err) {
            res.status(500).json({ respuesta: 'err_db' });
            console.log(err.message);
            return;
        }

        res.status(200).json({ respuesta: 'correcta' });
    });
});

module.exports = router