const express = require('express');
const router = express.Router();

//

const mysql = require('../services/mysql.js');

//

router.get('/', async (req, res) => {

    if (req.userId == undefined) {
        res.status(500).json({ respuesta: 'err_user' });
        return;
    }

    // NUEVOS MENSAJES

    const mensajes = await new Promise((resolve) => {
        mysql.query(`SELECT chat.nuevosMensajes AS count FROM usuarios_chats as chat
            INNER JOIN usuarios_chats_mensajes as men
            ON men.chatID=chat.ID AND men.emisorID!=?
            WHERE (chat.usuario1=? OR chat.usuario2=?) AND chat.nuevosMensajes>0 AND chat.nuevoEn=men.creadoEn`, [req.userId, req.userId, req.userId], function(err, result) {

                if(err) {
                    return resolve(0);
                }

                if(result.length === 0) {
                    return resolve(0);
                }

                resolve(result[0].count);
            }
        );
    });

    // VALORACIONES COMO CLIENTE

    const userVal = await new Promise((resolve) => {
        mysql.query('SELECT COUNT(*) as count FROM usuarios_valoraciones WHERE sinLeer=0 AND userValoradoID=?', req.userId, function(err, result) {
            if(err) {
                return resolve(0);
            }
            resolve(result[0].count);
        });
    });

    // VALORACIONES COMO HOSPEDADOR

    const hospedadorVal = await new Promise((resolve) => {
        mysql.query(`SELECT COUNT(*) as count FROM alojamientos_valoraciones as val
            INNER JOIN alojamientos as alo ON  alo.usuarioID=?
            WHERE val.sinLeer=0 AND val.alojamientoID=alo.ID`, req.userId, function(err, result) {
                if(err) {
                    return resolve(0);
                }
                resolve(result[0].count);
            }
        );
    });

    // ENVIA TODO
    
    res.status(200).json({ 
        nuevosMensajes: mensajes,
        valoraciones: userVal + hospedadorVal,
    });
});


module.exports = router