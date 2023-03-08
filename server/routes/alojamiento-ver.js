const express = require('express');
const router = express.Router();

//

const mysql = require('../services/mysql.js');
const { serviciosCasas, totalServicios, diasEntreFechas } = require('../services/utils.js');

//

router.get('/ver/:id', (req, res) => {

    const id = req.params.id;

    var queryStr = '';

    if (req.userId === undefined) {
        queryStr += 'SELECT * FROM alojamientos WHERE ID=? LIMIT 1';

    } else {
        queryStr = 'SELECT alo.*, fav.ID as favorito FROM alojamientos as alo \
        LEFT JOIN usuarios_favoritos as fav ON fav.alojamientoID=alo.ID AND fav.usuarioID=' + req.userId + ' \
        WHERE alo.ID=? LIMIT 1';
    }

    mysql.query(queryStr, id, (err, result) => {

        if (err) {
            res.status(500).json({ respuesta: 'err_db' });
            console.log(err.message);
            return;
        }

        if (result.length == 0) {
            res.status(500).json({ respuesta: 'err_datos' });
            return;
        }

        // SERVICIOS

        const servicios = result[0].servicios;
        const lenServicios = serviciosCasas.length;

        for(var i = 0; i < lenServicios; i++) {
            result[0][serviciosCasas[i].toLowerCase()] = servicios >> (totalServicios-i) & 0x1;
        }

        //

        if (result[0].favorito === undefined) {
            result[0].favorito = null;
        }

        var entrada = result[0].horaEntrada;
        var salida = result[0].horaSalida;

        if (entrada != null) {
            result[0].horaEntrada = entrada.substring(0, 5);
        }

        if (salida != null) {
            result[0].horaSalida = salida.substring(0, 5);
        }

        res.status(200).json({ respuesta: 'correcto', alojamiento: result });

        mysql.query('UPDATE alojamientos SET visitas=? WHERE ID=? LIMIT 1', [result[0].visitas + 1, result[0].ID]);
        if (req.userId != undefined) mysql.query('INSERT INTO alojamientos_vistos (usuarioID,alojamientoID) VALUES (?) ON DUPLICATE KEY UPDATE veces=veces+1;', [[ req.userId, result[0].ID ]]);
    });
});

router.get('/hospedador/:id', (req, res) => {

    const hospedadorId = req.params.id;

    mysql.query('SELECT * FROM usuarios WHERE ID=? LIMIT 1', hospedadorId, function (err, result) {

        if (err) {
            res.status(500).json({ respuesta: 'err_db' });
            console.log(err.message);
            return;
        }

        if (result.length == 0) {
            res.status(401).json({ respuesta: 'err_datos' });
            return;
        }

        var userJson = {
            ID: hospedadorId,
            nombre: result[0].nombre,
            creadoEn: result[0].fechaReg
        };

        res.status(200).json({ respuesta: 'correcto', hospedador: userJson });
    });
});

router.get('/valoraciones/:id', (req, res) => {

    const alojamientoId = req.params.id;

    mysql.query('SELECT valLlegada,valVeracidad,valComunicacion,valUbicacion,valLimpieza,valCalidad FROM alojamientos_valoraciones WHERE alojamientoID=?', alojamientoId, function (err, result) {
        if (err) {
            res.status(500).json({ respuesta: 'err_db' });
            console.log(err.message);
            return;
        }

        var final = {
            llegada: 0.0,
            veracidad: 0.0,
            comunicacion: 0.0,
            ubicacion: 0.0,
            limpieza: 0.0,
            calidad: 0.0,
        };

        const len = result.length;

        if (len > 0) {

            for (var i = 0; i < len; i++) {

                var item = result[i];

                final.llegada += item.valLlegada;
                final.veracidad += item.valVeracidad;
                final.comunicacion += item.valComunicacion;
                final.ubicacion += item.valUbicacion;
                final.limpieza += item.valLimpieza;
                final.calidad += item.valCalidad;
            }

            final.llegada = (final.llegada / len).toFixed(1);
            final.veracidad = (final.veracidad / len).toFixed(1);
            final.comunicacion = (final.comunicacion / len).toFixed(1);
            final.ubicacion = (final.ubicacion / len).toFixed(1);
            final.limpieza = (final.limpieza / len).toFixed(1);
            final.calidad = (final.calidad / len).toFixed(1);
        }

        res.status(200).json({ respuesta: 'correcto', valoraciones: final });
    });
});

router.get('/comentarios/:id', (req, res) => {

    const alojamientoId = req.params.id;

    mysql.query(`SELECT val.creadaEn,val.mensaje,usu.ID as usuarioId,usu.nombre,usu.residencia,usu.fechaReg FROM alojamientos_valoraciones as val 
        INNER JOIN usuarios as usu ON val.usuarioID=usu.ID
        WHERE val.alojamientoID=? ORDER BY val.creadaEn DESC`, alojamientoId,
        function (err, result) {

            if (err) {
                res.status(500).json({ respuesta: 'err_db' });
                console.log(err.message);
                return;
            }

            res.status(200).json({ respuesta: 'correcto', valoraciones: result });
        }
    );
});

router.get('/reservas/dias/:id', (req, res) => {

    const alojamientoId = req.params.id;

    mysql.query('SELECT fechaEntrada,fechaSalida FROM usuarios_reservas WHERE alojamientoID=? AND (fechaEntrada >= CURDATE() OR fechaSalida >= CURDATE()) AND (estado=0 OR estado=1)', alojamientoId,
        function (err, result) {

            if (err) {
                res.status(500).json({ respuesta: 'err_db' });
                console.log(err.message);
                return;
            }

            var len = result.length;
            const fechaHoy = new Date();

            var arrayReservados = [
                { 
                    day: fechaHoy.getDate(), month: fechaHoy.getMonth() + 1, year: fechaHoy.getFullYear() 
                }
            ];

            for (var i = 0; i < len; i++) {

                var inicio = new Date(result[i].fechaEntrada);

                if(inicio.getTime() < fechaHoy.getTime()) {
                    inicio = new Date();
                    inicio.setDate(inicio.getDate() + 1);
                }

                const final = new Date(result[i].fechaSalida);

                var diff = diasEntreFechas(inicio, final);

                for (var w = 0; w < diff; w++) {

                    var objeto = {
                        day: inicio.getDate(),
                        month: inicio.getMonth() + 1,
                        year: inicio.getFullYear(),
                    }

                    arrayReservados.push(objeto);
                    inicio.setDate(objeto.day + 1);
                }
            }

            res.status(200).json({ respuesta: 'correcto', reservados: arrayReservados });
        });
});

module.exports = router