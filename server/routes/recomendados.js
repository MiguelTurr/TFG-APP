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

    var arrayTotal = [];

    const arrayFav = await new Promise((resolve) => {
        mysql.query(`SELECT alo.ID,alo.precio,alo.ubicacion,alo.lat,alo.lng FROM usuarios_favoritos as fav 
            INNER JOIN alojamientos as alo ON fav.alojamientoID=alo.ID
            WHERE fav.usuarioID=? LIMIT 10`, req.userId, function (err, result) {

            if (err) {
                res.status(500).json({ respuesta: 'err_db' });

                console.log(err.message);
                return;
            }

            return resolve(result);
        });
    });

    const arrayReservados = await new Promise((resolve) => {
        mysql.query(`SELECT alo.ID,alo.precio,alo.ubicacion,alo.lat,alo.lng FROM usuarios_reservas as res 
            INNER JOIN alojamientos as alo ON res.alojamientoID=alo.ID
            WHERE res.usuarioID=? GROUP BY res.alojamientoID LIMIT 10`, req.userId, function (err, result) {

            if (err) {
                res.status(500).json({ respuesta: 'err_db' });

                console.log(err.message);
                return;
            }

            return resolve(result);
        });
    }); 

    arrayTotal = arrayFav;

    const lenReservados = arrayReservados.length;
    const lenFav = arrayFav.length;

    var encontrado;

    for(var i = 0; i < lenReservados; i++) {

        encontrado = false;

        for(var w = 0; w < lenFav; w++) {
            if(arrayReservados[i].ID === arrayFav[w].ID) {
                encontrado = true;
                break;
            }
        }
        if(encontrado === false) {
            arrayTotal.push(arrayReservados[i]);
        }
    }

    //

    if (arrayTotal.length === 0) {
        res.status(200).json({ respuesta: 'correcto', recomendados: [], experiencias: [] });
        return;
    }

    // RECOMENDACIONES

    const len = arrayTotal.length;
    var precioMedio = 0.0;
    var latMedia = 0.0;
    var lngMedia = 0.0;

    for(var i = 0; i < len; i++) {
        precioMedio += arrayTotal[i].precio;
        latMedia += arrayTotal[i].lat;
        lngMedia += arrayTotal[i].lng;
    }
    precioMedio /= len;
    latMedia /= len;
    lngMedia /= len;

    // RECOMENDACIONES

    const recomendaciones = await new Promise((resolve) => {
        mysql.query(`SELECT t1.ID,t1.ubicacion,t1.precio,t1.creadoEn,t1.visitas,t1.valoracionMedia,t1.vecesValorado FROM alojamientos t1
            LEFT JOIN usuarios_favoritos t2 ON t1.ID = t2.alojamientoID 
            WHERE t2.alojamientoID IS NULL AND t1.usuarioID!=? AND t1.precio BETWEEN ? AND ? LIMIT 4`, 
            [
                req.userId,
                precioMedio-20, 
                precioMedio+20
            ], 
            
            function(err, result) {
                if (err) {
                    res.status(500).json({ respuesta: 'err_db' });
                    console.log(err.message);
                    return;
                }

                resolve(result);
            }
        );
    });

    // NUEVAS EXPERIENCIAS

    const experiencias = await new Promise((resolve) => {
        mysql.query(`SELECT t1.ID,t1.ubicacion,t1.precio,t1.creadoEn,t1.visitas,t1.valoracionMedia,t1.vecesValorado FROM alojamientos t1
            LEFT JOIN usuarios_favoritos t2 ON t1.ID = t2.alojamientoID 
            WHERE t2.alojamientoID IS NULL AND t1.usuarioID!=? AND t1.lat NOT BETWEEN ? AND ? AND t1.lng NOT BETWEEN ? AND ? ORDER BY t1.creadoEn DESC LIMIT 4`, 
            [
                req.userId,
                latMedia-2, 
                latMedia+2,
                lngMedia-2, 
                lngMedia+2,
            ], 
            
            function(err, result) {
                if (err) {
                    res.status(500).json({ respuesta: 'err_db' });
                    console.log(err.message);
                    return;
                }

                resolve(result);
            }
        );
    });

    res.status(500).json({ respuesta: 'correcto', recomendados: recomendaciones, experiencias: experiencias });
});

module.exports = router