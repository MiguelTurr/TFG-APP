const express = require('express');
const router = express.Router();

//

const mysql = require('../services/mysql.js');
const utils = require('../services/utils.js');
const fs = require("fs");

//

router.get('/', (req, res) => {

    if (req.userId == undefined) {
        res.status(500).json({ respuesta: 'err_user' });
        return;
    }

    mysql.query(`SELECT chat.*,usu.nombre,usu.ultimaConexion FROM usuarios_chats as chat 
        INNER JOIN usuarios as usu ON usu.ID!=? AND (chat.usuario1=usu.ID OR chat.usuario2=usu.ID)
        WHERE chat.usuario1=? OR chat.usuario2=?
        ORDER BY chat.nuevoEn DESC`, [req.userId, req.userId, req.userId], async function(err, result) {

        if (err) {
            res.status(500).json({ respuesta: 'err_db' });
            console.log(err.message);
            return;
        }

        var arrayFinal = [];

        const fechaHoy = new Date();
        const len = result.length;
        for(var i = 0; i < len; i++) {

            const mensaje = await new Promise((resolve) => {

                mysql.query('SELECT mensaje,emisorID FROM usuarios_chats_mensajes WHERE chatID=? ORDER BY creadoEn DESC LIMIT 1', [result[i].ID], function(err, result) {
                    if(err) {
                        return resolve([]);
                    }
                    return resolve(result);
                })
            });

            var fechaFin = new Date(result[i].nuevoEn).getTime();
            var diff = utils.diasEntreFechas(fechaFin, fechaHoy.getTime());

            var ultimaConexion = new Date(result[i].ultimaConexion);
            var ultimaVez = fechaHoy.getDate() - ultimaConexion.getDate();

            var textoUltimaConexion = '';

            if(ultimaVez === 0) {
                textoUltimaConexion = 'Hoy a las ' + ultimaConexion.toLocaleTimeString('es-Es', { hour: '2-digit', minute: '2-digit'});

            } else if(ultimaVez === 1 && fechaHoy.getMonth() === ultimaConexion.getMonth()) {
                textoUltimaConexion = 'Ayer a las ' + ultimaConexion.toLocaleTimeString('es-Es', { hour: '2-digit', minute: '2-digit'});

            } else {
                textoUltimaConexion = ultimaConexion.toLocaleDateString('es-Es', { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit'});
            }

            var objeto = {
                chatID: result[i].ID,
                hablarID: result[i].usuario1 === req.userId ? result[i].usuario2 : result[i].usuario1,
                nombre: result[i].nombre,
                ultimaConexion: textoUltimaConexion,
                fecha: result[i].nuevoEn,
                hoy: diff <= 1 ? true : false,
                sinLeer: mensaje[0].emisorID === req.userId ? 0 : result[i].nuevosMensajes,

                // MENSAJE

                propio: mensaje[0].emisorID === req.userId ? true : false,
                mensaje: mensaje[0].mensaje.includes('////imagen////') ? 'Foto' : mensaje[0].mensaje,
            }

            arrayFinal.push(objeto);
        }
        
        res.status(200).json({ respuesta: 'correcto', chats: arrayFinal });
    });
});

router.get('/chat/:id', (req, res) => {

    if (req.userId == undefined) {
        res.status(500).json({ respuesta: 'err_user' });
        return;
    }

    const chatId = req.params.id;

    mysql.query('SELECT ID,emisorID,creadoEn,mensaje FROM usuarios_chats_mensajes WHERE chatID=? LIMIT 50', chatId, function(err, result) {
        if (err) {
            res.status(500).json({ respuesta: 'err_db' });
            console.log(err.message);
            return;
        }

        var len = result.length;

        if(result[len-1].emisorID !== req.userId) {
            mysql.query('UPDATE usuarios_chats SET nuevosMensajes=0 WHERE ID=?', chatId);
        }

        for(var i = 0; i < len; i++) {
            result[i].propio = result[i].emisorID === req.userId ? true : false;

            if(result[i].mensaje.includes('////imagen////')) {
                result[i].imagen = true;
            }
        }

        res.status(200).json({ respuesta: 'correcto', mensajes: result });
    });
});

router.post('/nuevo-mensaje', async (req, res) => {

    if (req.userId == undefined) {
        res.status(500).json({ respuesta: 'err_user' });
        return;
    }

    if(req.userId == req.body.hablarId) {
        res.status(500).json({ respuesta: 'err_chat' });
        return;
    }

    if(req.body.chatID === undefined) {

        mysql.query('INSERT INTO usuarios_chats (usuario1, usuario2) VALUES (?)', 
        [
            [
                req.userId,
                req.body.hablarId
            ]
        ], function(err, result) {
            if(err) {
                res.status(500).json({ respuesta: 'err_db' });
                console.log(err.message);
                return;
            }

            //

            mysql.query('INSERT INTO usuarios_chats_mensajes (chatID, emisorID, mensaje) VALUES (?)', [[ result.insertId, req.userId, req.body.mensaje ]]);

            //
            
            res.status(200).json({ respuesta: 'correcto', chatID: result.insertId });
        });

        return;
    }

    mysql.query('INSERT INTO usuarios_chats_mensajes (chatID, emisorID, mensaje) VALUES (?)', 
    [
        [
            req.body.chatID,
            req.userId,
            req.body.mensaje,
        ]
    ], function(err) {
        if (err) {
            res.status(500).json({ respuesta: 'err_db' });
            console.log(err.message);
            return;
        }

        mysql.query('UPDATE usuarios_chats SET nuevosMensajes=nuevosMensajes+1,nuevoEn=NOW() WHERE ID=?', req.body.chatID);
        res.status(200).json({ respuesta: 'correcto' });
    });
});

router.post('/nuevo-foto', (req, res) => {

    if (req.userId == undefined) {
        res.status(500).json({ respuesta: 'err_user' });
        return;
    }

    if(req.userId == req.body.hablarId) {
        res.status(500).json({ respuesta: 'err_chat' });
        return;
    }

    const file = req.files.imagen;
    const extension = file.mimetype.split('/')[1];

    mysql.query('INSERT INTO usuarios_chats_mensajes (chatID, emisorID, mensaje) VALUES (?)', 
    [
        [
            req.body.chatID,
            req.userId,
            '////imagen////.' +extension,
        ]
    ], function(err, result) {
        if (err) {
            res.status(500).json({ respuesta: 'err_db' });
            console.log(err.message);
            return;
        }
        const nombreFile = req.body.chatID+ '_' +result.insertId+ '.' +extension;

        file.mv('./imagenes/chats/' +nombreFile);

        //

        mysql.query('UPDATE usuarios_chats SET nuevosMensajes=nuevosMensajes+1,nuevoEn=NOW() WHERE ID=?', req.body.chatID);
        res.status(200).json({ respuesta: 'correcto', imagenId: result.insertId });
    });
});

router.get('/chat-foto/:id', (req, res) => {

    const [chatId, mensajeId, extension] = req.params.id.split('-');
    const nombreFile = chatId+ '_' +mensajeId+ '.' +extension;

    fs.readFile('./imagenes/chats/' +nombreFile, function (err, file) {

        if (err) {
            res.status(500).json({ respuesta: 'err_file' });
            return;
        }

        res.set({ 'Content-Type': 'image/jpg' });
        res.end(file);
    });
});


module.exports = router