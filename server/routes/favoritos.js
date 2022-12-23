const express = require('express');
const router = express.Router();

//

const mysql = require('../services/mysql.js');

//

router.get('/', (req, res) => {

    if (req.userId == undefined) {
        res.status(500).json({ respuesta: 'err_user' });
        return;
    }

    mysql.query('SELECT alo.* FROM `usuarios_favoritos` as fav INNER JOIN `alojamientos` as alo ON fav.alojamientoID=alo.ID WHERE fav.usuarioID=?', req.userId, function (err, result) {

        if (err) {
            res.status(500).json({ respuesta: 'err_db' });
            console.log(err.message);
            return;
        }

        res.status(200).json({ respuesta: 'correcto', alojamientos: result });
    });
});


router.get('/add/:id', (req, res) => {

    if (req.userId == undefined) {
        res.status(500).json({ respuesta: 'err_user' });
        return;
    }

    const alojamientoId = req.params.id;

    mysql.query('INSERT INTO usuarios_favoritos (usuarioID, alojamientoID) VALUES (?)', [
        [
            req.userId,
            parseInt(alojamientoId)
        ]
    ], function (err) {

        if (err) {
            res.status(500).json({ respuesta: 'err_db' });
            console.log(err.message);
            return;
        }

        res.status(200).json({ respuesta: 'correcto', fav: true });
    }
    );
});

router.get('/borrar/:id', (req, res) => {

    if (req.userId == undefined) {
        res.status(500).json({ respuesta: 'err_user' });
        return;
    }

    const alojamientoId = req.params.id;

    mysql.query('DELETE FROM usuarios_favoritos WHERE usuarioID=? AND alojamientoID=?', [req.userId, parseInt(alojamientoId)], function (err) {

        if (err) {
            res.status(500).json({ respuesta: 'err_db' });
            console.log(err.message);
            return;
        }

        res.status(200).json({ respuesta: 'correcto', fav: false });
    });
});

router.get('/borrar-todos', (req, res) => {

    if (req.userId == undefined) {
        res.status(500).json({ respuesta: 'err_user' });
        return;
    }

    mysql.query('DELETE FROM usuarios_favoritos WHERE usuarioID=?', [req.userId], function (err) {

        if (err) {
            res.status(500).json({ respuesta: 'err_db' });
            console.log(err.message);
            return;
        }

        res.status(200).json({ respuesta: 'correcto', fav: false });
    });
});

module.exports = router