const express = require('express');
const router = express.Router();

//

const mysql = require('../services/mysql.js');
const email = require('../services/email.js');
const utils = require('../services/utils.js');

const { dev_state } = require('../services/config.js');

//

router.get('/activas', (req, res) => {

    if (req.userId == undefined) {
        res.status(500).json({ respuesta: 'err_user' });
        return;
    }

    mysql.query(`SELECT res.*,alo.ubicacion,alo.valoracionMedia,alo.vecesValorado,alo.usuarioID,usu.nombre FROM usuarios_reservas as res 
        INNER JOIN alojamientos as alo ON res.alojamientoID=alo.ID
        INNER JOIN usuarios as usu ON alo.usuarioID=usu.ID
        WHERE res.usuarioID=? AND res.valoraEstancia=-1 AND res.estado!='Cancelado' ORDER BY res.creadoEn DESC`, req.userId, function (err, result) {

        if (err) {
            res.status(500).json({ respuesta: 'err_db' });
            console.log(err.message);
            return;
        }

        var itemFinal = [];
        var len = result.length;

        for (var i = 0; i < len; i++) {

            var element = result[i];

            const inicio = new Date(element.fechaEntrada);
            const final = new Date(element.fechaSalida);

            var dias = utils.diasEntreFechas(inicio, final);

            var objeto = {

                // RESERVA

                reservaID: element.ID,
                alojamientoID: element.alojamientoID,

                fechas: utils.rangoFechas(inicio, final),
                dias: dias,
                viajeros: element.numeroViajeros,
                mascotas: element.numeroMascotas,
                precioBase: element.precioBase,
                costeTotal: element.costeTotal,
                estado: utils.estadoReserva(element.estado, final, element.valoraEstancia),

                // DUEÑO

                propietarioID: element.usuarioID,
                propietarioNombre: element.nombre,

                // ALOJAMIENTO

                ubicacion: element.ubicacion,
                vecesValorado: element.vecesValorado,
                valoracionMedia: element.valoracionMedia,
            };

            itemFinal.push(objeto);
        }

        res.status(200).json({ respuesta: 'correcto', reservas: itemFinal });
    });
});

router.get('/antiguas', (req, res) => {

    if (req.userId == undefined) {
        res.status(500).json({ respuesta: 'err_user' });
        return;
    }

    mysql.query(`SELECT res.*,alo.ubicacion,alo.valoracionMedia,alo.vecesValorado FROM usuarios_reservas as res 
        INNER JOIN alojamientos as alo ON res.alojamientoID=alo.ID
        WHERE res.usuarioID=? AND (res.valoraEstancia!=-1 OR res.estado='Cancelado') ORDER BY res.creadoEn DESC`, req.userId, function (err, result) {

        if (err) {
            res.status(500).json({ respuesta: 'err_db' });
            console.log(err.message);
            return;
        }

        var itemFinal = [];
        var len = result.length;

        for (var i = 0; i < len; i++) {

            var element = result[i];

            const inicio = new Date(element.fechaEntrada);
            const final = new Date(element.fechaSalida);

            var dias = utils.diasEntreFechas(inicio, final);

            var objeto = {

                // RESERVA

                reservaID: element.ID,
                alojamientoID: element.alojamientoID,
                userValoracion: element.valoraEstancia,
                hospedadorValoracion: element.valoraHospedador,
                
                fechas: utils.rangoFechas(inicio, final, element.valoraEstancia),
                dias: dias,
                viajeros: element.numeroViajeros,
                mascotas: element.numeroMascotas,
                precioBase: element.precioBase,
                costeTotal: element.costeTotal,
                estado: utils.estadoReserva(element.estado, final),

                // ALOJAMIENTO

                ubicacion: element.ubicacion,
                vecesValorado: element.vecesValorado,
                valoracionMedia: element.valoracionMedia,
            };

            itemFinal.push(objeto);
        }

        res.status(200).json({ respuesta: 'correcto', reservas: itemFinal });
    }
    );
});

router.get('/alojamientos/activas', (req, res) => {
    
    if (req.userId == undefined) {
        res.status(500).json({ respuesta: 'err_user' });
        return;
    }

    mysql.query(`SELECT res.*,alo.ubicacion,alo.valoracionMedia,alo.vecesValorado,usu.nombre,usu.residencia,usu.fechaReg FROM usuarios_reservas as res 
        INNER JOIN alojamientos as alo ON res.alojamientoID=alo.ID AND alo.usuarioID=?
        INNER JOIN usuarios as usu ON usu.ID=res.usuarioID
        WHERE res.valoraHospedador=-1 AND res.estado!='Cancelado' ORDER BY res.creadoEn DESC`, req.userId, function (err, result) {

        if (err) {
            res.status(500).json({ respuesta: 'err_db' });
            console.log(err.message);
            return;
        }

        var itemFinal = [];
        var len = result.length;

        for (var i = 0; i < len; i++) {

            var element = result[i];

            const inicio = new Date(element.fechaEntrada);
            const final = new Date(element.fechaSalida);

            var dias = utils.diasEntreFechas(inicio, final);

            var objeto = {

                // RESERVA

                reservaID: element.ID,
                alojamientoID: element.alojamientoID,
                usuarioID: element.usuarioID,

                fechas: utils.rangoFechas(inicio, final),
                dias: dias,
                viajeros: element.numeroViajeros,
                mascotas: element.numeroMascotas,
                precioBase: element.precioBase,
                costeTotal: element.costeTotal,
                estado: utils.estadoAlojamientoReserva(element.estado, final, element.valoraHospedador),

                // ALOJAMIENTO

                ubicacion: element.ubicacion,
                vecesValorado: element.vecesValorado,
                valoracionMedia: element.valoracionMedia,

                // USUARIO

                fechaReg: element.fechaReg,
                nombre: element.nombre,
                residencia: element.residencia,            
            };

            itemFinal.push(objeto);
        }

        res.status(200).json({ respuesta: 'correcto', reservas: itemFinal });
    });
});

router.get('/alojamientos/antiguas', (req, res) => {
    
    if (req.userId == undefined) {
        res.status(500).json({ respuesta: 'err_user' });
        return;
    }

    mysql.query(`SELECT res.*,alo.ubicacion,alo.valoracionMedia,alo.vecesValorado,usu.nombre,usu.residencia,usu.fechaReg FROM usuarios_reservas as res 
        INNER JOIN alojamientos as alo ON res.alojamientoID=alo.ID AND alo.usuarioID=?
        INNER JOIN usuarios as usu ON usu.ID=res.usuarioID
        WHERE res.valoraHospedador!=-1 OR res.estado='Cancelado' ORDER BY res.creadoEn DESC`, req.userId, function (err, result) {

        if (err) {
            res.status(500).json({ respuesta: 'err_db' });
            console.log(err.message);
            return;
        }

        var itemFinal = [];
        var len = result.length;

        for (var i = 0; i < len; i++) {

            var element = result[i];

            const inicio = new Date(element.fechaEntrada);
            const final = new Date(element.fechaSalida);

            var dias = utils.diasEntreFechas(inicio, final);

            var objeto = {

                // RESERVA

                reservaID: element.ID,
                alojamientoID: element.alojamientoID,
                usuarioID: element.usuarioID,
                userValoracion: element.valoraEstancia,
                hospedadorValoracion: element.valoraHospedador,

                fechas: utils.rangoFechas(inicio, final),
                dias: dias,
                viajeros: element.numeroViajeros,
                mascotas: element.numeroMascotas,
                precioBase: element.precioBase,
                costeTotal: element.costeTotal,
                estado: utils.estadoAlojamientoReserva(element.estado, final, element.valoraHospedador),

                // ALOJAMIENTO

                ubicacion: element.ubicacion,
                vecesValorado: element.vecesValorado,
                valoracionMedia: element.valoracionMedia,

                // USUARIO

                fechaReg: element.fechaReg,
                nombre: element.nombre,
                residencia: element.residencia,            
            };

            itemFinal.push(objeto);
        }

        res.status(200).json({ respuesta: 'correcto', reservas: itemFinal });
    });
});

router.get('/alojamientos/cancelar/:id', (req, res) => {

    if (req.userId == undefined) {
        res.status(500).json({ respuesta: 'err_user' });
        return;
    }

    const reservaID = req.params.id;

    mysql.query("UPDATE usuarios_reservas SET estado='Cancelado' WHERE ID=? LIMIT 1", reservaID, function (err) {
        if (err) {
            res.status(500).json({ respuesta: 'err_db' });
            console.log(err.message);
            return;
        }

        res.status(200).json({ respuesta: 'correcto' });

        // CORREO AL USUARIO DE CANCELAR

        mysql.query(`SELECT alo.ubicacion,alo.titulo,res.fechaEntrada,res.fechaSalida,usu.email FROM usuarios_reservas as res
        INNER JOIN alojamientos as alo ON res.alojamientoID=alo.ID
        INNER JOIN usuarios as usu ON res.usuarioID=usu.ID AND usu.recibirCorreos=1
        WHERE res.ID=?`, 
        [
            reservaID
        ], 
        function(err, result) {

            if(err || result.length === 0) {
                return;
            }

            try {

                var entrada = new Date(result[0].fechaEntrada);
                var salida = new Date(result[0].fechaSalida);

                var textoEmail = 'Hola, parece que se ha cancelado una de tus reservas.\n\n';
                textoEmail += 'Título: ' +result[0].titulo+ '\n';
                textoEmail += 'Ubicación: ' +result[0].ubicacion+ '\n';
                textoEmail += 'Fechas: ' +utils.rangoFechas(entrada, salida);
                textoEmail += '\n\nUn saludo desde 2FH.'

                email.sendMail({
                    from: 'FastForHolidays',
                    to: (dev_state === true) ? 'pepecortezri@gmail.com' : result[0].email,
                    subject: '¡Reserva cancelada!',
                    text: textoEmail
                });

            } catch (err) {
                console.log(err);
            }
        });
    });
});

router.get('/alojamientos/aceptar/:id', (req, res) => {

    if (req.userId == undefined) {
        res.status(500).json({ respuesta: 'err_user' });
        return;
    }

    const reservaID = req.params.id;

    mysql.query("UPDATE usuarios_reservas SET estado='Aceptado' WHERE ID=? LIMIT 1", reservaID, function (err) {
        if (err) {
            res.status(500).json({ respuesta: 'err_db' });
            console.log(err.message);
            return;
        }

        res.status(200).json({ respuesta: 'correcto' });

        // CORREO AL USUARIO DE ACEPTAR

        mysql.query(`SELECT alo.ubicacion,alo.titulo,alo.usuarioID,res.fechaEntrada,res.fechaSalida,usu.email FROM usuarios_reservas as res
        INNER JOIN alojamientos as alo ON res.alojamientoID=alo.ID
        INNER JOIN usuarios as usu ON res.usuarioID=usu.ID AND usu.recibirCorreos=1
        WHERE res.ID=?`, 
        [
            reservaID
        ], 
        function(err, result) {

            if(err || result.length === 0) {
                return;
            }

            try {

                var entrada = new Date(result[0].fechaEntrada);
                var salida = new Date(result[0].fechaSalida);

                var textoEmail = 'Hola, parece que se ha aceptado una de tus reservas.\n\n';
                textoEmail += 'Título: ' +result[0].titulo+ '\n';
                textoEmail += 'Ubicación: ' +result[0].ubicacion+ '\n';
                textoEmail += 'Fechas: ' +utils.rangoFechas(entrada, salida);
                textoEmail += '\n\nUn saludo desde 2FH.'

                email.sendMail({
                    from: 'FastForHolidays',
                    to: (dev_state === true) ? 'pepecortezri@gmail.com' : result[0].email,
                    subject: '¡Reserva aceptada!',
                    text: textoEmail
                });

            } catch (err) {
                console.log(err);
            }
        });
    });
});

router.get('/valoracion-hospedador/:id', (req, res) => {

    const valoracionId = req.params.id;

    mysql.query(`SELECT val.creadoEn,val.mensaje,usu.fechaReg,usu.ID,usu.nombre,usu.residencia FROM usuarios_valoraciones as val 
        INNER JOIN usuarios as usu ON val.usuarioID=usu.ID 
        WHERE val.ID=? LIMIT 1`, valoracionId,

        function (err, result) {

            if (err) {
                res.status(500).json({ respuesta: 'err_db' });
                console.log(err.message);
                return;
            }

            res.status(200).json({ respuesta: 'correcto', valoracion: result });
        }
    );
});

router.get('/valoracion-cliente/:id', (req, res) => {

    const valoracionId = req.params.id;

    //mysql.query(`SELECT val.creadaEn,val.mensaje,val.valLlegada,val.valVeracidad,val.valComunicacion,val.valUbicacion,val.valLimpieza,val.valCalidad,usu.fechaReg,usu.ID,usu.nombre,usu.residencia
    mysql.query(`SELECT val.creadaEn,val.mensaje,usu.fechaReg,usu.ID,usu.nombre,usu.residencia FROM alojamientos_valoraciones as val 
        INNER JOIN usuarios as usu ON val.usuarioID=usu.ID 
        WHERE val.ID=? LIMIT 1`, valoracionId,

        function (err, result) {

            if (err) {
                res.status(500).json({ respuesta: 'err_db' });

                console.log(err.message);
                return;
            }

            res.status(200).json({ respuesta: 'correcto', valoracion: result });
        }
    );

});

module.exports = router