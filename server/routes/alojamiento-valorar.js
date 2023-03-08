const express = require('express');
const router = express.Router();

//

const mysql = require('../services/mysql.js');

const { dev_state } = require('../services/config.js');
const { enviarCorreo } = require('../services/utils.js');

//

router.post('/', (req, res) => {

    if (req.userId == undefined) {
        res.status(500).json({ respuesta: 'err_user' });
        return;
    }

    mysql.query('INSERT INTO alojamientos_valoraciones (usuarioID,alojamientoID,mensaje,valLlegada,valVeracidad,valComunicacion,valUbicacion,valLimpieza,valCalidad) VALUES (?)',
        [
            [
                req.userId,
                req.body.alojamientoID,
                req.body.mensaje,
                req.body.llegada,
                req.body.veracidad,
                req.body.comunicacion,
                req.body.ubicacion,
                req.body.limpieza,
                req.body.calidad,
            ]
        ], function (err, result) {

            if (err) {
                res.status(500).json({ respuesta: 'err_db' });
                console.log(err.message);
                return;
            }

            // ACTUALIZAR RESERVA

            var valoracionId = result.insertId;

            mysql.query('UPDATE usuarios_reservas SET valoraEstancia=? WHERE ID=?', [valoracionId, req.body.reservaID]);

            //

            const llegada = parseFloat(req.body.llegada);
            const veracidad = parseFloat(req.body.veracidad);
            const comunicacion = parseFloat(req.body.comunicacion);
            const ubicacion = parseFloat(req.body.ubicacion);
            const limpieza = parseFloat(req.body.limpieza);
            const calidad = parseFloat(req.body.calidad);

            const media = (llegada + veracidad + comunicacion + ubicacion + limpieza + calidad) / 6;

            const vecesValorado = parseInt(req.body.vecesValorado) + 1;
            var valoracionMedia = (req.body.valoracionMedia + media) / 2;

            mysql.query('UPDATE alojamientos SET vecesValorado=?,valoracionMedia=? WHERE ID=? LIMIT 1', [vecesValorado, valoracionMedia.toFixed(2), req.body.alojamientoID]);

            // ENVIAR CORREO AL DUEÑO ALOJAMIENTO

            mysql.query(`SELECT usu.email,alo.titulo,alo.ubicacion 
                FROM alojamientos as alo 
                INNER JOIN usuarios as usu ON alo.usuarioID=usu.ID AND usu.recibirCorreos=1
                WHERE alo.ID=?`, req.body.alojamientoID, function (err, result) {

                if (err) {
                    console.log(err.message);
                    return;
                }

                if (result.length === 0) {
                    return;
                }

                // ENVIA

                try {

                    const titulo = result[0].titulo + ' ha recibido una valoración';
                    const texto = 'Hola, nuevas valoraciones sobre su alojamiento en ' + result[0].ubicacion + ' se han hecho, visite su perfil para leerlas.\n\nUn saludo desde 2FH.';

                    enviarCorreo(titulo, texto, result[0].email);

                } catch (err) {
                    console.log(err);
                }
            });

            //

            res.status(200).json({ respuesta: 'correcto', userValoracion: valoracionId });
        }
    );
});

module.exports = router