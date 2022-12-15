const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const mysql = require("./services/mysql.js");
const email = require("./services/email.js");

const fs = require("fs");

const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const bcrypt = require('bcrypt');
const randomstring = require("randomstring");

const utils = require('./services/utils.js');
const { bcrypt_salt, cookie_secret, dev_state } = require('./services/config.js');

//

const server = express();

server.use(express.json({ limit: '50mb' }));
server.use(express.urlencoded({ extended: true, limit: '50mb' }));
server.use(express.static('imagenes'));

server.use(express.json());
server.use(cookieParser(
    //secret: your_secret,
));

server.use(cors({
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST']
}));

server.use(fileUpload());

//

const hostname = 'localhost';
const port = 8000;

//

server.listen(port, function () {
    console.log(`El servidor se está ejecutando en http://${hostname}:${port}/`);
});

//

const comprobarToken = (req, _, next) => {

    const token = req.cookies.token;

    if (token) {
        try {
            const decoded = jwt.verify(token, cookie_secret);
            req.userId = decoded.id;

        } catch (err) {
        }
    }

    next();
};

//

server.get('/cookies/aceptar', (req, res) => {

    res.status(200).cookie('cookiesAceptadas', true, {
        httpOnly: false,
        expires: new Date(Date.now() + 31536000000),
        secure: false,
        sameSite: true
    }).end();

});

server.post('/registrar', async (req, res) => {

    const passwordHash = await bcrypt.hash(req.body.password, bcrypt_salt);

    const validarEmail = randomstring.generate({
        length: 50,
        charset: 'alphanumeric',
    });

    mysql.query("INSERT INTO usuarios (verificacion, email, password, nombre, apellidos, genero, fechaNac, telefono, residencia) VALUES (?)",
        [
            [
                validarEmail,
                req.body.email,
                passwordHash,
                req.body.nombre,
                req.body.apellidos,
                req.body.genero,
                req.body.fechaNac,
                req.body.telefono,
                req.body.residencia
            ]
        ], (err) => {

            if (err) {

                console.log(err);
                console.log(err.message);

                if (err.code == 'ER_DUP_ENTRY') {
                    res.status(500).json({ respuesta: 'err_email' });
                    return;
                }

                res.status(500).json({ respuesta: 'err_db' });
                return;
            }

            // CORREO VERIFICACIÓN

            try {

                var texto = 'Hola ' + req.body.nombre + ' ' + req.body.apellidos + ', su cuenta se ha creado correctamente, para verificarla pulsa el siguiente link:';
                texto += '\n\n';
                texto += 'localhost:3000/validar/' + validarEmail;
                texto += '\n\nUn saludo desde 2FH.'

                email.sendMail({
                    from: 'FastForHolidays',
                    to: req.body.email,
                    subject: 'Código de verificación - 2FH',
                    text: texto
                });

                res.status(201).json({ respuesta: 'correcto' });

            } catch (err) {
                res.status(401).json({ respuesta: 'err_envia_correo' });
            }
        });
});

server.post('/login', (req, res) => {

    const userEmail = req.body.email;
    const userPassword = req.body.password;

    mysql.query("SELECT * FROM usuarios WHERE email=? LIMIT 1", userEmail, async (err, result) => {

        if (err) {
            console.log(err);
            console.log(err.message);

            res.status(500).json({ respuesta: 'err_db' });
            return;
        }

        if (result.length == 0) {
            res.status(401).json({ respuesta: 'err_datos' });
            return;
        }

        const match = await bcrypt.compare(userPassword, result[0].password);
        if (!match) {
            res.status(401).json({ respuesta: 'err_datos' });
            return;
        }

        if (result[0].activo == 0) {
            res.status(401).json({ respuesta: 'err_validado' });
            return;
        }

        const id = result[0].ID;
        const token = jwt.sign({ id }, cookie_secret);

        res.status(201)
            .cookie('token', token, {
                httpOnly: true,
                expires: new Date(Date.now() + 31536000000),
                secure: true

            }).json({
                respuesta: 'correcto',
                autorizacion: true,
                nombre: result[0].nombre
            });
    });
});

server.post('/logout', comprobarToken, (req, res) => {
    res.status(200).clearCookie("token");
    res.end();
});

server.post('/noPassword', (req, res) => {

    const emailRequest = req.body.email;

    mysql.query("SELECT passReset,nombre FROM usuarios WHERE email=? AND activo=1 LIMIT 1", emailRequest, async (err, result) => {

        if (err) {
            console.log(err);
            console.log(err.message);

            res.status(500).json({ respuesta: 'err_db' });
            return;
        }

        if (result.length == 0) {
            res.status(401).json({ respuesta: 'err_datos' });
            return;
        }

        const fechaHoy = new Date().getTime() / 1000;
        const fechaReset = result[0].passReset;

        if (fechaReset > fechaHoy) {
            res.status(401).json({ respuesta: 'err_reset' });
            return;
        }

        const nuevaPassword = randomstring.generate({
            length: 7,
            charset: 'alphanumeric',
        });

        const passwordHash = await bcrypt.hash(nuevaPassword, bcrypt_salt);
        const nuevoReset = fechaHoy + 86400000;

        const userNombre = result[0].nombre;

        mysql.query("UPDATE usuarios SET password=?,passReset=? WHERE email=? LIMIT 1", [passwordHash, nuevoReset, emailRequest], function (err) {

            if (err) {
                console.log(err);
                console.log(err.message);

                res.status(500).json({ respuesta: 'err_db' });
                return;
            }

            try {

                var texto = 'Hola ' + userNombre + ', la contraseña vinculada a este correo ha sido reseteada correctamente:';
                texto += '\n\n';
                texto += 'Nueva contraseña: ' + nuevaPassword;
                texto += '\n\nUn saludo desde 2FH.'

                email.sendMail({
                    to: emailRequest,
                    subject: 'Cambio de contraseña - 2FH',
                    text: texto
                });

                res.status(201).json({ respuesta: 'correcto' });

            } catch (err) {
                res.status(401).json({ respuesta: 'err_envia_correo' });
                console.log(err);
            }
        })
    });
});

server.get('/validar/:id', (req, res) => {

    const verificacion = req.params.id;

    mysql.query("SELECT * FROM usuarios WHERE activo=0 AND verificacion=? LIMIT 1", verificacion, async (err, result) => {

        if (err) {
            console.log(err);
            console.log(err.message);

            res.status(500).json({ respuesta: 'err_db' });
            return;
        }

        if (result.length == 0) {
            res.status(401).json({ respuesta: 'err_datos' });
            return;
        }

        mysql.query("UPDATE usuarios SET activo=1 WHERE activo=0 AND verificacion=? LIMIT 1", verificacion, async (err) => {

            if (err) {
                console.log(err);
                console.log(err.message);

                res.status(500).json({ respuesta: 'err_db' });
                return;
            }

            res.status(201).json({ respuesta: 'correcto' });
        });
    });
});

server.get('/perfil', comprobarToken, (req, res) => {

    if (req.userId == undefined) {
        res.status(500).json({ respuesta: 'err_user' });
        return;
    }

    mysql.query("SELECT * FROM usuarios WHERE ID=? LIMIT 1", req.userId, (err, result) => {
        if (err) {
            res.status(500).json({ respuesta: 'err_db' });

            console.log(err.message);
            return;
        }

        res.status(201).json({
            ID: result[0].ID,
            nombre: result[0].nombre,
            apellidos: result[0].apellidos,
            fechaNac: result[0].fechaNac,
            genero: result[0].genero == 0 ? 'Hombre' : 'Mujer',
            telefono: result[0].telefono,
            residencia: result[0].residencia,
            presentacion: result[0].presentacion,
            trabajo: result[0].trabajo == '' ? 'Sin expecificar' : result[0].trabajo,
            idiomas: result[0].idiomas,

            fechaReg: result[0].fechaReg,
            email: result[0].email,
            imagenPerfil: result[0].imgPerfil,
            recibirCorreos: result[0].recibirCorreos === 0 ? 'Desactivado' : 'Activado',
        });
    });
});

server.post('/perfil/editar', comprobarToken, (req, res) => {

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

        //

        var query = 'UPDATE usuarios SET ';

        var datoEditado = req.body.editado;
        if (req.body.tipo == 'password') {
            datoEditado = await bcrypt.hash(datoEditado, bcrypt_salt);

        } else if (req.body.tipo == 'imagen') {
            const extension = req.body.editado.split('.')[1];
            datoEditado = utils.nombreFotoPerfil(req.userId, extension);

            req.body.tipo = 'imgPerfil';
        }

        query += req.body.tipo + '="' + datoEditado + '" ';
        query += 'WHERE ID=' + req.userId + ' LIMIT 1';

        mysql.query(query, function (err, result) {
            if (err) {
                res.status(500).json({ respuesta: 'err_db' });

                console.log(err.message);
                return;
            }

            if (result.affectedRows == 0) {
                res.status(500).json({ respuesta: 'err_datos' });
                return;
            }

            if (req.files != undefined) {
                const avatar = req.files.imagen;
                avatar.mv('./imagenes/perfil/' + datoEditado);
            }

            res.status(200).json({ respuesta: 'correcto' });
        });
    });
});

server.post('/perfil/editar/estado', comprobarToken, (req, res) => {

    if (req.userId == undefined) {
        res.status(500).json({ respuesta: 'err_user' });
        return;
    }

    var query = 'UPDATE usuarios SET ';

    query += req.body.tipo + '=' + parseInt(req.body.editado) + ' ';
    query += 'WHERE ID=' + req.userId + ' LIMIT 1';

    mysql.query(query, function (err, result) {
        if (err) {
            res.status(500).json({ respuesta: 'err_db' });

            console.log(err.message);
            return;
        }

        if (result.affectedRows == 0) {
            res.status(500).json({ respuesta: 'err_datos' });
            return;
        }

        if (req.files != undefined) {
            const avatar = req.files.imagen;
            avatar.mv('./imagenes/perfil/' + datoEditado);
        }

        res.status(200).json({ respuesta: 'correcto' });
    });
});

server.post('/perfil/borrar', comprobarToken, (req, res) => {

    if (req.userId == undefined) {
        res.status(500).json({ respuesta: 'err_user' });
        return;
    }

    var query = 'UPDATE usuarios SET ';

    if (req.body.tipo == 'imagen') {

        query += "imgPerfil='default.png' ";

        fs.unlink('./imagenes/perfil/' + req.body.borrar, (err) => {
            if (err) {
                res.status(500).json({ respuesta: 'err_server' });

                console.log(err);
                return;
            }
        });
    }

    query += 'WHERE ID=' + req.userId + ' LIMIT 1';

    mysql.query(query, function (err) {

        if (err) {
            res.status(500).json({ respuesta: 'err_db' });

            console.log(err.message);
            return;
        }

        res.status(200).json({ respuesta: 'correcto' });
    });
});

server.get('/perfil/foto', comprobarToken, (req, res) => {

    if (req.userId == undefined) {
        res.status(500).json({ respuesta: 'err_user' });
        return;
    }

    mysql.query("SELECT imgPerfil FROM usuarios WHERE ID=? LIMIT 1", req.userId, (err, result) => {

        if (err) {
            res.status(500).json({ respuesta: 'err_db' });
            console.log(err.message);
            return;
        }

        const imagen = result[0].imgPerfil;

        fs.readFile('./imagenes/perfil/' + imagen, function (err, file) {

            if (err) {
                res.status(500).json({ respuesta: 'err_file' });
                return;
            }

            res.set({ 'Content-Type': 'image/jpg' });
            res.end(file);
        });
    });
});

server.get('/perfil/eliminar', comprobarToken, (req, res) => {

    if (req.userId == undefined) {
        res.status(500).json({ respuesta: 'err_user' });
        return;
    }

    mysql.query('DELETE FROM usuarios WHERE ID=? LIMIT 1', req.userId, function (err) {

        if (err) {
            res.status(500).json({ respuesta: 'err_db' });
            console.log(err.message);
            return;
        }

        res.status(200).clearCookie("token").json({ respuesta: 'correcto' });
    })
});

server.get('/perfil/misalojamientos', comprobarToken, (req, res) => {

    if (req.userId == undefined) {
        res.status(500).json({ respuesta: 'err_user' });
        return;
    }

    mysql.query('SELECT ID,ubicacion,precio,descuento,creadoEn,visitas,valoracionMedia,vecesValorado,valoracionesNuevas FROM alojamientos WHERE usuarioID=? ORDER BY creadoEn DESC', req.userId, function (err, result) {
        if (err) {
            res.status(500).json({ respuesta: 'err_db' });

            console.log(err.message);
            return;
        }

        res.status(200).json({ respuesta: 'correcto', alojamientos: result });
    });
});

server.post('/perfil/misalojamientos/crear', comprobarToken, (req, res) => {

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

    mysql.query('INSERT INTO alojamientos (usuarioID, titulo, descripcion, precio, ubicacion, localidad, provincia, comunidad, pais, lat, lng, viajeros, habitaciones, camas, aseos, horaEntrada, horaSalida, puedeFumar, puedeFiestas, servicios) VALUES (?)',
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
                parseFloat(req.body.long),

                parseInt(req.body.viajeros),
                parseInt(req.body.habitaciones),
                parseInt(req.body.camas),
                parseInt(req.body.aseos),
                horaEntrada,
                horaSalida,
                utils.boolToInt(req.body.puedeFumar),
                utils.boolToInt(req.body.puedeFiestas),
                servicios_final
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

                const extension = file.name.split('.')[1];
                const nombreFile = utils.nombreFotoAlojamiento(alojamientoId, 0, extension);

                file.mv('./imagenes/casas/' + nombreFile);

                arrayNombreImagenes.push([alojamientoId, nombreFile]);

            } else {

                for (var i = 0; i < imagenLen; i++) {

                    const file = req.files.imagen[i];

                    const extension = file.name.split('.')[1];
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

server.post('/perfil/misalojamientos/editar/:id', comprobarToken, (req, res) => {

    if (req.userId == undefined) {
        res.status(500).json({ respuesta: 'err_user' });
        return;
    }

    //console.log(req.body);
});

server.get('/perfil/mis-reservas/activas', comprobarToken, (req, res) => {

    if (req.userId == undefined) {
        res.status(500).json({ respuesta: 'err_user' });
        return;
    }

    mysql.query(`SELECT res.*,alo.ubicacion,alo.valoracionMedia,alo.vecesValorado FROM usuarios_reservas as res 
        INNER JOIN alojamientos as alo ON res.alojamientoID=alo.ID
        WHERE res.usuarioID=? AND res.valoraEstancia=-1 AND res.estado!=-1 ORDER BY res.creadoEn DESC`, req.userId, function (err, result) {

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

                fechaEntrada: inicio,
                fechaSalida: final,
                dias: dias,
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

server.get('/perfil/mis-reservas/antiguas', comprobarToken, (req, res) => {

    if (req.userId == undefined) {
        res.status(500).json({ respuesta: 'err_user' });
        return;
    }

    mysql.query(`SELECT res.*,alo.ubicacion,alo.valoracionMedia,alo.vecesValorado FROM usuarios_reservas as res 
        INNER JOIN alojamientos as alo ON res.alojamientoID=alo.ID
        WHERE res.usuarioID=? AND (res.valoraEstancia!=-1 OR res.estado=-1) ORDER BY res.creadoEn DESC`, req.userId, function (err, result) {

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

                fechaEntrada: inicio,
                fechaSalida: final,
                dias: dias,
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

server.post('/perfil/valorar/alojamiento', comprobarToken, (req, res) => {

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

            mysql.query('UPDATE usuarios_reservas SET estado=2,valoraEstancia=? WHERE ID=?', [valoracionId, req.body.reservaID]);

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

            mysql.query('UPDATE alojamientos SET vecesValorado=?,valoracionMedia=?,valoracionesNuevas=1 WHERE ID=? LIMIT 1', [vecesValorado, valoracionMedia.toFixed(2), req.body.alojamientoID]);

            // ENVIAR CORREO AL DUEÑO ALOJAMIENTO

            mysql.query('SELECT usu.email,alo.titulo,alo.ubicacion FROM alojamientos as alo INNER JOIN usuarios as usu ON alo.usuarioID=usu.ID WHERE alo.ID=?', req.body.alojamientoID, function (err, result) {
                if (err) {
                    console.log(err.message);
                    return;
                }

                if (result.length === 0) {
                    return;
                }

                // ENVIA

                if (dev_state === false) {

                    try {

                        var texto = 'Hola, nuevas valoraciones sobre su alojamiento en ' + result[0].ubicacion + ' se han hecho, visite su perfil para leerlas.';
                        texto += '\n\nUn saludo desde 2FH.'

                        email.sendMail({
                            from: 'FastForHolidays',
                            to: (dev_state === true) ? 'pepecortezri@gmail.com' : result[0].email,
                            subject: result[0].titulo + ' ha recibido una valoración',
                            text: texto
                        });

                    } catch (err) {
                        console.log(err);
                    }
                }
            });

            //

            res.status(200).json({ respuesta: 'correcto', userValoracion: valoracionId });
        });
});

server.post('/perfil/valorar/inquilino', comprobarToken, (req, res) => {

    if (req.userId == undefined) {
        res.status(500).json({ respuesta: 'err_user' });
        return;
    }

    // HACER

});

server.get('/perfil/valoracion-hospedador/ver/:id', (req, res) => {

    const valoracionId = req.params.id;

    mysql.query(`SELECT val.creadoEn,val.mensaje,usu.fechaReg,usu.ID,usu.nombre,usu.residencia
        FROM usuarios_valoraciones as val 
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

server.get('/perfil/valoracion-cliente/ver/:id', (req, res) => {

    const valoracionId = req.params.id;

    //mysql.query(`SELECT val.creadaEn,val.mensaje,val.valLlegada,val.valVeracidad,val.valComunicacion,val.valUbicacion,val.valLimpieza,val.valCalidad,usu.fechaReg,usu.ID,usu.nombre,usu.residencia
    mysql.query(`SELECT val.creadaEn,val.mensaje,usu.fechaReg,usu.ID,usu.nombre,usu.residencia
        FROM alojamientos_valoraciones as val 
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

server.get('/perfil/valoracion-hospedador/ver/:id', (req, res) => {

});

server.get('/perfil/nuevos-mensajes', comprobarToken, async (req, res) => {

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

server.get('/perfil/mis-chats', comprobarToken, (req, res) => {

    if (req.userId == undefined) {
        res.status(500).json({ respuesta: 'err_user' });
        return;
    }

    mysql.query(`SELECT chat.*, usu.nombre FROM usuarios_chats as chat 
        INNER JOIN usuarios as usu ON usu.ID!=? AND (chat.usuario1=usu.ID OR chat.usuario2=usu.ID)
        WHERE chat.usuario1=? OR chat.usuario2=?
        ORDER BY chat.nuevoEn DESC`, [req.userId, req.userId, req.userId], async function(err, result) {

        if (err) {
            res.status(500).json({ respuesta: 'err_db' });

            console.log(err.message);
            return;
        }

        var arrayFinal = [];

        const fechaHoy = new Date().getTime();
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
            var diff = utils.diasEntreFechas(fechaFin, fechaHoy);

            var objeto = {
                chatID: result[i].ID,
                hablarID: result[i].usuario1 === req.userId ? result[i].usuario2 : result[i].usuario1,
                nombre: result[i].nombre,
                fecha: result[i].nuevoEn,
                hoy: diff <= 1 ? true : false,
                sinLeer: mensaje[0].emisorID === req.userId ? 0 : result[i].nuevosMensajes,

                // MENSAJE

                propio: mensaje[0].emisorID === req.userId ? true : false,
                mensaje: mensaje[0].mensaje,
            }

            arrayFinal.push(objeto);
        }
        
        res.status(200).json({ respuesta: 'correcto', chats: arrayFinal });
    });
});

server.get('/perfil/mis-chats/chat/:id', comprobarToken, (req, res) => {

    if (req.userId == undefined) {
        res.status(500).json({ respuesta: 'err_user' });
        return;
    }

    const chatId = req.params.id;

    mysql.query('SELECT emisorID,creadoEn,mensaje FROM usuarios_chats_mensajes WHERE chatID=? LIMIT 50', chatId, function(err, result) {
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
        }

        res.status(200).json({ respuesta: 'correcto', mensajes: result });
    });
});

server.post('/perfil/mis-chats/nuevo-mensaje', comprobarToken, (req, res) => {

    if (req.userId == undefined) {
        res.status(500).json({ respuesta: 'err_user' });
        return;
    }

    if(req.body.chatID === undefined) {

        mysql.query('INSERT INTO usuarios_chats (usuario1, usuario2) VALUES (?)', [
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

            mysql.query('INSERT INTO usuarios_chats_mensajes (chatID, emisorID, mensaje) VALUES (?)', [
                [
                    result.insertId,
                    req.userId,
                    req.body.mensaje,
                ]
            ]);

            //
            
            res.status(200).json({ respuesta: 'correcto', chatID: result.insertId });
        });

        return;
    }

    mysql.query('INSERT INTO usuarios_chats_mensajes (chatID, emisorID, mensaje) VALUES (?)', [
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

server.get('/perfil/favoritos', comprobarToken, (req, res) => {

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

server.get('/perfil/recomendados',  comprobarToken, async (req, res) => {

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
        res.status(500).json({ respuesta: 'correcto', recomendados: [] });
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
        mysql.query(`SELECT t1.ID,t1.ubicacion,t1.precio,t1.descuento,t1.creadoEn,t1.visitas,t1.valoracionMedia,t1.vecesValorado,t1.valoracionesNuevas FROM alojamientos t1
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
        mysql.query(`SELECT t1.ID,t1.ubicacion,t1.precio,t1.descuento,t1.creadoEn,t1.visitas,t1.valoracionMedia,t1.vecesValorado,t1.valoracionesNuevas FROM alojamientos t1
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

//

server.get('/alojamiento/hospedador/:id', (req, res) => {

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

server.get('/alojamiento/hospedador/foto/:id', comprobarToken, (req, res) => {

    const hospedadorId = req.params.id;

    mysql.query("SELECT imgPerfil FROM usuarios WHERE ID=? LIMIT 1", hospedadorId, (err, result) => {

        if (err) {
            res.status(500).json({ respuesta: 'err_db' });

            console.log(err.message);
            return;
        }

        const imagen = result[0].imgPerfil;

        fs.readFile('./imagenes/perfil/' + imagen, function (err, file) {

            if (err) {
                res.status(500).json({ respuesta: 'err_file' });
                return;
            }

            res.set({ 'Content-Type': 'image/jpg' });
            res.end(file);
        });
    });
});

server.get('/alojamiento/valoraciones/:id', (req, res) => {

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

server.get('/alojamiento/comentarios/:id', (req, res) => {

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

server.get('/alojamiento/add-favorito/:id', comprobarToken, (req, res) => {

    const alojamientoId = req.params.id;

    if (req.userId == undefined) {
        res.status(500).json({ respuesta: 'err_user' });
        return;
    }

    mysql.query('INSERT INTO usuarios_favoritos (usuarioID, alojamientoID) VALUES (?)', [
        [
            req.userId,
            parseInt(alojamientoId)
        ]
    ], function (err) {

        if (err) {
            res.status(500).json({ respuesta: 'err_db' });
            console.log(err.message);
            console.log(err);
            return;
        }

        res.status(200).json({ respuesta: 'correcto', fav: true });
    }
    );
});

server.get('/alojamiento/remove-favorito/:id', comprobarToken, (req, res) => {

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

server.get('/alojamiento/ver/:id', comprobarToken, (req, res) => {

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

        var servicios = result[0].servicios;

        result[0].cocina = servicios >> 8;
        result[0].wifi = servicios >> 7 & 0x1;
        result[0].animales = servicios >> 6 & 0x01;
        result[0].aparcamiento = servicios >> 5 & 0x001;
        result[0].piscina = servicios >> 4 & 0x0001;
        result[0].lavadora = servicios >> 3 & 0x00001;
        result[0].aire = servicios >> 2 & 0x000001;
        result[0].calefaccion = servicios >> 1 & 0x0000001;
        result[0].television = servicios & 0x0000001;

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
    });
});

server.get('/alojamiento/imagen/:id', (req, res) => {

    const [id, index] = req.params.id.split('-');

    mysql.query("SELECT nombre FROM alojamientos_img WHERE alojamientoID=?", id, (err, result) => {

        if (err) {
            res.status(500).json({ respuesta: 'err_db' });
            console.log(err.message);
            return;
        }

        if (result.length === 0) {
            res.status(500).json({ respuesta: 'err_db' });
            return;
        }

        const imagen = result[index].nombre;

        fs.readFile('./imagenes/casas/' + imagen, function (err, file) {

            if (err) {
                res.status(500).json({ respuesta: 'err_file' });
                return;
            }

            res.set({ 'Content-Type': 'image/*' });
            res.end(file);
        });
    });
});

server.get('/alojamiento/reservas/dias/:id', (req, res) => {

    const alojamientoId = req.params.id;

    mysql.query('SELECT fechaEntrada,fechaSalida FROM usuarios_reservas WHERE alojamientoID=? AND fechaEntrada >= CURDATE()', alojamientoId,
        function (err, result) {

            if (err) {
                res.status(500).json({ respuesta: 'err_db' });
                console.log(err.message);
                return;
            }

            var len = result.length;
            const fechaHoy = new Date();
            var arrayReservados = [{ day: fechaHoy.getDate(), month: fechaHoy.getMonth() + 1, year: fechaHoy.getFullYear() } ];

            for (var i = 0; i < len; i++) {
                var inicio = new Date(result[i].fechaEntrada);
                const final = new Date(result[i].fechaSalida);

                var diff = utils.diasEntreFechas(inicio, final);

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

/*
server.get('', (req, res) => {
});*/

server.get('/alojamiento/reservar/:id', comprobarToken, (req, res) => {

    if (req.userId == undefined) {
        res.status(500).json({ respuesta: 'err_user' });
        return;
    }

    const alojamientoId = req.params.id;

    mysql.query('SELECT ID,ubicacion,precio,descuento,descuentoHasta,valoracionMedia,vecesValorado FROM alojamientos WHERE ID=? LIMIT 1', alojamientoId, function (err, result) {
        if (err) {
            res.status(500).json({ respuesta: 'err_db' });
            console.log(err.message);
            return;
        }

        if(req.userId === result[0].usuarioID) {
            return res.status(500).json({ respuesta: 'err_reserva' });
        }

        res.status(200).json({ respuesta: 'correcto', alojamiento: result[0] });
    });
});

server.post('/alojamiento/reservar', comprobarToken, (req, res) => {

    if (req.userId == undefined) {
        res.status(500).json({ respuesta: 'err_user' });
        return;
    }

    // HACER
});

//

server.get('/usuario/ver/:id', (req, res) => {

    const userId = req.params.id;

    mysql.query('SELECT nombre,apellidos,presentacion,residencia,trabajo,idiomas,fechaReg FROM usuarios WHERE ID=? LIMIT 1', userId, function (err, result) {

        if (err) {
            res.status(500).json({ respuesta: 'err_db' });

            console.log(err.message);
            return;
        }

        if (result.length == 0) {
            res.status(401).json({ respuesta: 'err_datos' });
            return;
        }

        res.status(200).json({ respuesta: 'correcto', user: result });
    });
});

server.get('/usuario/alojamientos/:id', (req, res) => {

    const userId = req.params.id;

    mysql.query('SELECT ID,valoracionMedia,vecesValorado,ubicacion FROM alojamientos WHERE usuarioID=? ORDER BY creadoEn DESC', userId, function (err, result) {
        if (err) {
            res.status(500).json({ respuesta: 'err_db' });

            console.log(err.message);
            return;
        }

        res.status(200).json({ respuesta: 'correcto', alojamientos: result });
    });
});

server.get('/usuario/alojamientos/valoraciones/:id', (req, res) => {

    const userId = req.params.id;

    mysql.query(`SELECT val.creadaEn,val.mensaje,alo.ID as alojamientoId,alo.ubicacion,usu.ID as usuarioId,usu.nombre,usu.residencia,usu.fechaReg FROM alojamientos as alo
        INNER JOIN alojamientos_valoraciones as val ON val.alojamientoID=alo.ID
        INNER JOIN usuarios as usu ON val.usuarioID=usu.ID 
        WHERE alo.usuarioID=? ORDER BY val.creadaEn DESC`, userId,

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

server.get('/usuario/valoraciones/:id', (req, res) => {

    const userId = req.params.id;

    mysql.query(`SELECT val.creadoEn,val.mensaje,usu.ID as usuarioId,usu.nombre,usu.residencia,usu.fechaReg FROM usuarios_valoraciones as val 
        INNER JOIN usuarios as usu ON val.usuarioID=usu.ID
        WHERE val.userValoradoID=? ORDER BY val.creadoEn DESC`, userId,
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

server.post('/usuario/denuncia', comprobarToken, (req, res) => {

    if (req.userId == undefined) {
        res.status(500).json({ respuesta: 'err_user' });
        return;
    }

    mysql.query('INSERT INTO usuarios_denuncias (usuarioID, reportadoID, mensaje) VALUES (?)',
        [
            [
                req.userId,
                req.body.denunciadoId,
                req.body.mensaje,
            ]
        ], function (err) {

            if (err) {
                res.status(500).json({ respuesta: 'err_db' });

                console.log(err.message);
                return;
            }

            res.status(200).json({ respuesta: 'correcto' });
        });
});

//

server.post('/buscar', comprobarToken, (req, res) => {

    var queryStr = '';

    if (req.userId == undefined) {
        queryStr += 'SELECT * FROM alojamientos as alo ';

    } else {
        queryStr += 'SELECT alo.*, fav.ID as favorito FROM `alojamientos` as alo ';
        queryStr += 'LEFT JOIN `usuarios_favoritos` as fav ON fav.alojamientoID=alo.ID AND fav.usuarioID=' + req.userId + ' ';
        queryStr += 'WHERE alo.usuarioID!=' + req.userId + ' ';
    }

    // FILTROS

    // DIRECCIÓN

    queryStr += 'AND alo.pais="' +req.body.pais+ '" ';

    if(req.body.comunidad !== undefined) {
        queryStr += 'AND alo.comunidad="' +req.body.comunidad+ '" ';
    }

    if(req.body.provincia !== undefined) {
        queryStr += 'AND alo.provincia="' +req.body.provincia+ '" ';
    }

    if(req.body.localidad !== undefined) {
        queryStr += 'AND alo.localidad="' +req.body.localidad+ '" ';
    }
    
    //

    queryStr += utils.queryOrdenar(req.body.ordenar);

    //

    mysql.query(queryStr, function(err, result) {
        
        if (err) {
            res.status(500).json({ respuesta: 'err_db' });
            console.log(err.message);
            return;
        }

        res.status(200).json({ respuesta: 'correcto', busqueda: result });
    });
});

server.post('/home', comprobarToken, (req, res) => {

    var queryStr = '';

    if (req.userId == undefined) {
        queryStr += 'SELECT * FROM alojamientos as alo ';

    } else {
        queryStr += 'SELECT alo.*, fav.ID as favorito FROM `alojamientos` as alo ';
        queryStr += 'LEFT JOIN `usuarios_favoritos` as fav ON fav.alojamientoID=alo.ID AND fav.usuarioID=' + req.userId + ' ';
        queryStr += 'WHERE alo.usuarioID!=' + req.userId + ' ';
    }

    // FILTROS


    // ORDENAR

    queryStr += utils.queryOrdenar(req.body.ordenar);

    // LIMIT

    queryStr += utils.queryLimit(req.body.contador);

    //

    mysql.query(queryStr, function (err, result) {
        if (err) {
            res.status(500).json({ respuesta: 'err_db' });

            console.log(err.message);
            return;
        }

        res.status(200).json({ respuesta: 'correcto', alojamientos: result });
    });
});