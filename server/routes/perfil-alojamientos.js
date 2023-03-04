const express = require('express');
const router = express.Router();

//

const mysql = require('../services/mysql.js');
const email = require("../services/email.js");
const utils = require('../services/utils.js');
const bcrypt = require('bcrypt');
const fs = require("fs");

const { dev_state } = require('../services/config.js');

//

router.get('/', (req, res) => {

    if (req.userId == undefined) {
        res.status(500).json({ respuesta: 'err_user' });
        return;
    }

    mysql.query('SELECT ID,ubicacion,precio,precioAnterior,creadoEn,visitas,valoracionMedia,vecesValorado FROM alojamientos WHERE usuarioID=? ORDER BY creadoEn DESC', req.userId, function (err, result) {
        if (err) {
            res.status(500).json({ respuesta: 'err_db' });
            console.log(err.message);
            return;
        }

        res.status(200).json({ respuesta: 'correcto', alojamientos: result });
    });
});

router.get('/:id', (req, res) => {

    if (req.userId == undefined) {
        res.status(500).json({ respuesta: 'err_user' });
        return;
    }

    const alojamientoID = req.params.id;

    mysql.query('SELECT * FROM alojamientos WHERE ID=? AND usuarioID=? LIMIT 1', [alojamientoID, req.userId], function (err, result) {
        if (err) {
            res.status(500).json({ respuesta: 'err_db' });
            console.log(err.message);
            return;
        }

        if(result.length === 0) {
            return res.status(500).json({ respuesta: 'err_db' });
        }

        // SERVICIOS

        const servicios = result[0].servicios;
        const lenServicios = utils.serviciosCasas.length;

        var arrayServicios = [];

        for(var i = 0; i < lenServicios; i++) {

            var value = servicios >> (utils.totalServicios-i) & 0x1;
            const servicioNombre = utils.serviciosCasas[i];

            result[0][servicioNombre.toLowerCase()] = value;
            if(value > 0) arrayServicios.push(servicioNombre);
        }

        result[0].strServicios = arrayServicios.toString().replaceAll(',', ', ');

        // FUENTES

        const lenFonts = utils.fontsDisponibles.length;
        for(var i = 0; i < lenFonts; i++) {
            if(utils.fontsDisponibles[i] === result[0].defaultFont) {
                result[0].fontIndex = i;
                break;
            }
        }

        // ENVIA

        res.status(200).json({ respuesta: 'correcto', alojamiento: result[0] });
    });
});

router.post('/crear', (req, res) => {

    if (req.userId == undefined) {
        res.status(500).json({ respuesta: 'err_user' });
        return;
    }

    var servicios_final = 0;

    servicios_final |= utils.boolToInt(req.body.cocina) << 8;
    servicios_final |= utils.boolToInt(req.body.wifi) << 7;
    servicios_final |= utils.boolToInt(req.body.animales) << 6;
    servicios_final |= utils.boolToInt(req.body.aparcamiento) << 5;
    servicios_final |= utils.boolToInt(req.body.piscina) << 4;
    servicios_final |= utils.boolToInt(req.body.lavadora) << 3;
    servicios_final |= utils.boolToInt(req.body.aire) << 2;
    servicios_final |= utils.boolToInt(req.body.calefaccion) << 1;
    servicios_final |= utils.boolToInt(req.body.television);

    const horaEntrada = req.body.horaEntrada === 'undefined' ? null : req.body.horaEntrada;
    const horaSalida = req.body.horaSalida === 'undefined' ? null : req.body.horaSalida;

    mysql.query('INSERT INTO alojamientos (usuarioID, titulo, descripcion, precio, ubicacion, localidad, provincia, comunidad, pais, lat, lng, viajeros, habitaciones, camas, aseos, horaEntrada, horaSalida, puedeFumar, puedeFiestas, servicios, imgCantidad) VALUES (?)',
        [
            [
                req.userId,
                req.body.titulo,
                req.body.descripcion,
                parseInt(req.body.precio),

                req.body.ubicacion,
                req.body.localidad,
                req.body.provincia === undefined ? '' : req.body.provincia,
                req.body.comunidad,
                req.body.pais,
                parseFloat(req.body.lat),
                parseFloat(req.body.lng),

                parseInt(req.body.viajeros),
                parseInt(req.body.habitaciones),
                parseInt(req.body.camas),
                parseInt(req.body.aseos),
                horaEntrada,
                horaSalida,
                utils.boolToInt(req.body.puedeFumar),
                utils.boolToInt(req.body.puedeFiestas),
                servicios_final,
                req.body.imgTotal,
            ]
        ], (err, result) => {
            if (err) {
                res.status(500).json({ respuesta: 'err_db' });
                console.log(err.message);
                return;
            }

            const alojamientoId = result.insertId;

            var arrayNombreImagenes = [];

            const imagenLen = req.files.imagen.length;
            if (imagenLen === undefined) {

                const file = req.files.imagen;

                const extension = file.mimetype.split('/')[1];
                const nombreFile = utils.nombreFotoAlojamiento(alojamientoId, 0, extension);

                file.mv('./imagenes/casas/' + nombreFile);

                arrayNombreImagenes.push([alojamientoId, nombreFile]);

            } else {

                for (var i = 0; i < imagenLen; i++) {

                    const file = req.files.imagen[i];

                    const extension = file.mimetype.split('/')[1];
                    const nombreFile = utils.nombreFotoAlojamiento(alojamientoId, i, extension);

                    file.mv('./imagenes/casas/' + nombreFile);

                    arrayNombreImagenes.push([alojamientoId, nombreFile]);
                }
            }

            mysql.query('INSERT INTO alojamientos_img (alojamientoID, nombre) VALUES ?', [arrayNombreImagenes]);

            //

            res.status(200).json({ respuesta: 'correcto', alojamientoId: alojamientoId });

        }
    );
});

router.post('/editar', (req, res) => {

    if (req.userId == undefined) {
        res.status(500).json({ respuesta: 'err_user' });
        return;
    }
    
    var queryStr = 'UPDATE alojamientos SET ';

    if(req.body.tipo === 'alojamiento') {

        var servicios_final = 0;

        servicios_final |= utils.boolToInt(req.body.cocina) << 8;
        servicios_final |= utils.boolToInt(req.body.wifi) << 7;
        servicios_final |= utils.boolToInt(req.body.mascotas) << 6;
        servicios_final |= utils.boolToInt(req.body.aparcamiento) << 5;
        servicios_final |= utils.boolToInt(req.body.piscina) << 4;
        servicios_final |= utils.boolToInt(req.body.lavadora) << 3;
        servicios_final |= utils.boolToInt(req.body.aire) << 2;
        servicios_final |= utils.boolToInt(req.body.calefaccion) << 1;
        servicios_final |= utils.boolToInt(req.body.television);

        queryStr += 'viajeros=' +req.body.viajeros+ ',habitaciones=' +req.body.habitaciones+ ',camas=' +req.body.camas+ ',aseos=' +req.body.aseos;
        queryStr += ',puedeFumar=' +req.body.puedeFumar+ ',puedeFiestas=' +req.body.puedeFiestas;
        queryStr += ',servicios=' +servicios_final+ ' ';

    } else if(req.body.tipo === 'imagenes') {
        const imagenesTotal = parseInt(req.body.imgTotal) - parseInt(req.body.contadorEliminadas) + parseInt(req.body.imgNuevas);
        queryStr += 'imgCantidad=' +imagenesTotal+ ' ';

    } else if(req.body.tipo === 'coste') {
        queryStr += 'precio=' +req.body.precio+ ',precioAnterior=' +req.body.precioAnterior+ ' ';

    } else if(req.body.tipo === 'fuente') {
        queryStr += 'defaultFont="' +utils.fontsDisponibles[parseInt(req.body.fontIndex)]+ '" ';

    } else {
        queryStr += req.body.tipo+ '="' +req.body.editado+ '" ';
    }

    queryStr += 'WHERE ID=' +req.body.alojamientoID+ ' AND usuarioID=' +req.userId;

    //

    mysql.query(queryStr, async function(err) {
        if (err) {
            res.status(500).json({ respuesta: 'err_db' });
            console.log(err.message);
            return;
        }

        res.status(200).json({ respuesta: 'correcto' });

        if(req.body.tipo === 'coste') {

            // ENVIAR CORREO SI EL COSTE DISMINUYE

            var precioFinal = parseInt(req.body.precio) + 10;

            if(precioFinal < req.body.precioAnterior) {

                mysql.query(`SELECT usu.email FROM usuarios_favoritos as fav
                    INNER JOIN usuarios as usu ON usu.ID=fav.usuarioID AND usu.recibirCorreos=1
                    WHERE fav.alojamientoID=?`, req.body.alojamientoID, function(err, result) {

                    if(err) {
                        return;
                    }

                    const len = result.length;

                    if(len === 0) {
                        return;
                    }

                    var textoEmail = 'Hola, parece que uno de tus alojamientos en favoritos ha disminuido su precio de ' +req.body.precioAnterior+ '€ a ' +req.body.precio+ '€.\n\n';
                    textoEmail += req.body.titulo+ '\n';
                    textoEmail += 'En: ' +req.body.ubicacion+ '\n';
                    textoEmail += 'Pulsa el siguiente link para verlo: http://localhost:3000/alojamiento/ver?casa=' +req.body.alojamientoID;
                    textoEmail += '\n\nUn saludo desde 2FH.'

                    for(var i = 0; i < len; i++) {

                        try {

                            email.sendMail({
                                from: 'FastForHolidays',
                                to: (dev_state === true) ? 'pepecortezri@gmail.com' : result[i].email,
                                subject: '¡Uno de tus alojamientos en favoritos está en oferta!',
                                text: textoEmail
                            });

                        } catch (err) {
                            console.log(err);
                        }
                    }
                });
            }

        } else if(req.body.tipo === 'imagenes') {

            const alojamientoId = req.body.alojamientoID;
            var indexInicio = parseInt(req.body.imgTotal) - parseInt(req.body.contadorEliminadas);

            if(req.body.contadorEliminadas > 0) {
                console.log('HAY ELIMINADAS');

                const resolucion = await new Promise((resolve) => {
                    mysql.query('SELECT ID,nombre FROM alojamientos_img WHERE alojamientoID=?', alojamientoId, function(err, result) {
                        if(err) {
                            return resolve([]);
                        }
                        resolve(result);
                    });
                });

                if(resolucion.length === 0) {
                    return;
                }
                
                //

                const arrayEliminadas = req.body.imagenesEliminadas.split(',');

                for(var i = 0; i < req.body.imgTotal; i++) {

                    //

                    if(arrayEliminadas[i] === 'true') {

                        fs.unlink('./imagenes/casas/' +resolucion[i].nombre, (err) => {
                            if(err) throw err;
                        });
                        mysql.query('DELETE FROM alojamientos_img WHERE ID=?', resolucion[i].ID);
                        resolucion[i].borrada = true;

                    }
                }

                var borradasAnterior = [];

                for(var i = 0; i < req.body.imgTotal; i++) {

                    if(resolucion[i].borrada === true) {
                        borradasAnterior.push(resolucion[i].nombre);

                    } else {
                        if(borradasAnterior.length > 0) {

                            const nombre = borradasAnterior[0];

                            fs.rename('./imagenes/casas/' +resolucion[i].nombre, './imagenes/casas/' +nombre, () => {
                                if(err) throw err;
                            });
                            mysql.query('UPDATE alojamientos_img SET nombre=? WHERE ID=?', [nombre, resolucion[i].ID]);

                            borradasAnterior.shift();
                            borradasAnterior.push(resolucion[i].nombre);
                        }
                    }

                }
            }

            //

            if(req.files !== null) {
                
                var arrayNombreImagenes = [];

                const imagenLen = req.files.imagen.length;
                if (imagenLen === undefined) {

                    const file = req.files.imagen;

                    const extension = file.name.split('.')[1];
                    const nombreFile = utils.nombreFotoAlojamiento(alojamientoId, indexInicio, extension);

                    file.mv('./imagenes/casas/' + nombreFile);

                    arrayNombreImagenes.push([alojamientoId, nombreFile]);

                } else {

                    for (var i = 0; i < imagenLen; i++) {

                        const file = req.files.imagen[i];

                        const extension = file.name.split('.')[1];
                        const nombreFile = utils.nombreFotoAlojamiento(alojamientoId, indexInicio+i, extension);

                        console.log('Creado: ' +nombreFile);

                        file.mv('./imagenes/casas/' + nombreFile);

                        arrayNombreImagenes.push([alojamientoId, nombreFile]);
                    }
                }

                mysql.query('INSERT INTO alojamientos_img (alojamientoID, nombre) VALUES ?', [arrayNombreImagenes]);
            }
        }
    });
});

router.post('/borrar', (req, res) => {

    if (req.userId == undefined) {
        res.status(500).json({ respuesta: 'err_user' });
        return;
    }

    mysql.query("SELECT password FROM usuarios WHERE ID=? LIMIT 1", req.userId, async (err, result) => {

        if (err) {
            res.status(500).json({ respuesta: 'err_db' });
            console.log(err.message);
            return;
        }

        if (result.length == 0) {
            res.status(500).json({ respuesta: 'err_user' });
            return;
        }

        const match = await bcrypt.compare(req.body.password, result[0].password);
        if (!match) {
            res.status(401).json({ respuesta: 'err_datos' });
            return;
        }

        // CONTRASEÑA CORRECTA - ELIMINAR

        mysql.query("DELETE FROM alojamientos WHERE ID=? LIMIT 1", req.body.alojamientoID, async (err) => {
            if (err) {
                res.status(500).json({ respuesta: 'err_db' });
                console.log(err.message);
                return;
            }

            res.status(200).json({ respuesta: 'correcto' });
        });
    });
});

module.exports = router