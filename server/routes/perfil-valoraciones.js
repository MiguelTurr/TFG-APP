const express = require('express');
const router = express.Router();

//

const mysql = require('../services/mysql.js');

//

router.get('/hechas-alo/:id', (req, res) => {

    if (req.userId == undefined) {
        res.status(500).json({ respuesta: 'err_user' });
        return;
    }

    const columns = req.params.id;

    mysql.query(`SELECT val.*,alo.ubicacion,alo.valoracionMedia,alo.vecesValorado FROM alojamientos_valoraciones as val
        INNER JOIN alojamientos as alo ON alo.ID=val.alojamientoID
        WHERE val.usuarioID=? ORDER BY creadaEn DESC LIMIT ?, 3`, [req.userId, 3 * columns], function(err, result) {

        if (err) {
            res.status(500).json({ respuesta: 'err_db' });
            console.log(err.message);
            return;
        }
        
        res.status(200).json({ respuesta: 'correcto', valoracion: result });
    });
});

router.get('/hechas-user/:id', (req, res) => {

    if (req.userId == undefined) {
        res.status(500).json({ respuesta: 'err_user' });
        return;
    }

    const columns = req.params.id;

    mysql.query(`SELECT val.*,usu.nombre FROM usuarios_valoraciones as val
        INNER JOIN usuarios as usu ON usu.ID=val.userValoradoID
        WHERE val.usuarioID=? ORDER BY creadoEn DESC LIMIT ?, 3`, [req.userId, 3 * columns], function(err, result) {

        if (err) {
            res.status(500).json({ respuesta: 'err_db' });
            console.log(err.message);
            return;
        }
        
        res.status(200).json({ respuesta: 'correcto', valoracion: result });
    });
});

router.get('/recibidas-alo/:id', (req, res) => {

    if (req.userId == undefined) {
        res.status(500).json({ respuesta: 'err_user' });
        return;
    }

    const columns = req.params.id;

    var queryStr = `SELECT alo.ubicacion,alo.valoracionMedia,alo.vecesValorado,val.ID,val.alojamientoID,val.usuarioID,val.creadaEn,val.sinLeer,val.mensaje,usu.nombre FROM alojamientos as alo
        INNER JOIN alojamientos_valoraciones as val ON alo.ID=val.alojamientoID AND val.sinLeer=0
        INNER JOIN usuarios as usu ON val.usuarioID=usu.ID
        WHERE alo.usuarioID=? ORDER BY creadaEn DESC`;

    if(columns > 0) {
        queryStr = `SELECT alo.ubicacion,alo.valoracionMedia,alo.vecesValorado,val.ID,val.alojamientoID,val.usuarioID,val.creadaEn,val.sinLeer,val.mensaje,usu.nombre FROM alojamientos as alo
        INNER JOIN alojamientos_valoraciones as val ON alo.ID=val.alojamientoID AND val.sinLeer!=0
        INNER JOIN usuarios as usu ON val.usuarioID=usu.ID
        WHERE alo.usuarioID=? ORDER BY creadaEn DESC LIMIT ${columns}, 3`;
    }

    mysql.query(queryStr, [req.userId], function(err, result) {

        if (err) {
            res.status(500).json({ respuesta: 'err_db' });
            console.log(err.message);
            return;
        }

        var len = result.length;

        if(len > 0) {
            res.status(200).json({ respuesta: 'correcto', valoracion: result });

            for(var i = 0; i < len; i++) {
                mysql.query('UPDATE alojamientos_valoraciones SET sinLeer=1 WHERE ID=?', result[i].ID);
            }

        } else if(columns == 0) {

            mysql.query(`SELECT alo.ubicacion,alo.valoracionMedia,alo.vecesValorado,val.ID,val.alojamientoID,val.usuarioID,val.creadaEn,val.sinLeer,val.mensaje,usu.nombre FROM alojamientos as alo
                INNER JOIN alojamientos_valoraciones as val ON alo.ID=val.alojamientoID AND val.sinLeer!=0
                INNER JOIN usuarios as usu ON val.usuarioID=usu.ID
                WHERE alo.usuarioID=? ORDER BY creadaEn DESC LIMIT 0, 3`, [req.userId], function(err, result) {

                if (err) {
                    res.status(500).json({ respuesta: 'err_db' });
                    console.log(err.message);
                    return;
                }

                res.status(200).json({ respuesta: 'correcto', valoracion: result });
            });

        } else {
            res.status(200).json({ respuesta: 'correcto', valoracion: [] });
        }
    });
});

router.get('/recibidas-user/:id', (req, res) => {

    if (req.userId == undefined) {
        res.status(500).json({ respuesta: 'err_user' });
        return;
    }

    const columns = req.params.id;

    var queryStr = `SELECT val.ID,val.usuarioID,val.sinLeer,val.creadoEn,val.tipo,val.mensaje,usu.nombre FROM usuarios_valoraciones as val
        INNER JOIN usuarios as usu ON usu.ID=val.usuarioID
        WHERE val.userValoradoID=? AND val.sinLeer=0 ORDER BY val.creadoEn DESC`;

    if(columns > 0) {
        queryStr = `SELECT val.ID,val.usuarioID,val.sinLeer,val.creadoEn,val.tipo,val.mensaje,usu.nombre FROM usuarios_valoraciones as val
        INNER JOIN usuarios as usu ON usu.ID=val.usuarioID
        WHERE val.userValoradoID=? AND val.sinLeer!=0 ORDER BY val.creadoEn DESC LIMIT ${columns}, 3`;
    }

    mysql.query(queryStr, [req.userId], function(err, result) {

        if (err) {
            res.status(500).json({ respuesta: 'err_db' });
            console.log(err.message);
            return;
        }

        var len = result.length;

        if(len > 0) {
            res.status(200).json({ respuesta: 'correcto', valoracion: result });
            mysql.query('UPDATE usuarios_valoraciones SET sinLeer=1 WHERE userValoradoID=?', req.userId);

        } else if(columns == 0) {

            mysql.query(`SELECT val.ID,val.usuarioID,val.sinLeer,val.creadoEn,val.tipo,val.mensaje,usu.nombre,usu.residencia,usu.fechaReg FROM usuarios_valoraciones as val
                INNER JOIN usuarios as usu ON usu.ID=val.usuarioID
                WHERE val.userValoradoID=? AND val.sinLeer!=0 ORDER BY val.creadoEn DESC LIMIT 0, 3`, [req.userId], function(err, result) {

                if (err) {
                    res.status(500).json({ respuesta: 'err_db' });
                    console.log(err.message);
                    return;
                }

                res.status(200).json({ respuesta: 'correcto', valoracion: result });
            });

        } else {
            res.status(200).json({ respuesta: 'correcto', valoracion: [] });
        }
    });
});

module.exports = router