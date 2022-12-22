const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const mysql = require("./services/mysql.js");
const email = require("./services/email.js");
const { paypal, paypalClient } = require("./services/paypal.js");

const PDFDocument = require('pdfkit');
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

            mysql.query('UPDATE usuarios SET ultimaConexion=NOW() WHERE ID=?', decoded.id);

        } catch (err) {
        }
    }

    next();
};

//

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

        } else if (result[0].activo == 2) { // QUITAR COMO CUENTA DESACTIVADA
            mysql.query('UPDATE usuarios SET activo=1 WHERE ID=?', result[0].ID);
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

                // ELIMINAR ANTERIOR

                const extensionEditado = datoEditado.split('.')[1];
                const extensionAnterior = req.body.imagenAnterior.split('.')[1];

                if(req.body.imagenAnterior !== 'default.png' && extensionEditado !== extensionAnterior) {
                    fs.unlink('./imagenes/perfil/' +req.body.imagenAnterior, (err) => {
                        if(err) throw err;
                        console.log('Archivo borrado');
                    });
                }

                //

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

server.post('/perfil/borrar/foto', comprobarToken, (req, res) => {

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

        mysql.query('UPDATE usuarios SET imgPerfil="default.png" WHERE ID=?', req.userId, function (err) {
            if (err) {
                res.status(500).json({ respuesta: 'err_db' });
                console.log(err.message);
                return;
            }

            fs.unlink('./imagenes/perfil/' + req.body.borrar, (err) => {
                if (err) {
                    res.status(500).json({ respuesta: 'err_server' });
                    console.log(err);
                    return;
                }
                res.status(200).json({ respuesta: 'correcto' });
            });
        });
    });
});

server.post('/perfil/borrar/cuenta', comprobarToken, (req, res) => {

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

        mysql.query('UPDATE usuarios SET activo=? WHERE ID=?', [req.body.tipo === 'desactivar' ? 1 : -1, req.userId], function (err) {
            if (err) {
                res.status(500).json({ respuesta: 'err_db' });
                console.log(err.message);
                return;
            }

            res.status(200).clearCookie("token").json({ respuesta: 'correcto' });
        });
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

server.get('/perfil/mis-alojamientos', comprobarToken, (req, res) => {

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

server.post('/perfil/mis-alojamientos/crear', comprobarToken, (req, res) => {

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

server.get('/perfil/mis-alojamientos/:id', comprobarToken, (req, res) => {

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

server.post('/perfil/mis-alojamientos/editar/', comprobarToken, (req, res) => {

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

server.post('/perfil/mis-alojamientos/borrar', comprobarToken, (req, res) => {

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

        // HACER

        console.log('BORRAR ALOJAMIENTO');
        res.status(200).json({ respuesta: 'correcto' });
    });
});

//

server.get('/perfil/mis-reservas/activas', comprobarToken, (req, res) => {

    if (req.userId == undefined) {
        res.status(500).json({ respuesta: 'err_user' });
        return;
    }

    mysql.query(`SELECT res.*,alo.ubicacion,alo.valoracionMedia,alo.vecesValorado,alo.usuarioID,usu.nombre FROM usuarios_reservas as res 
        INNER JOIN alojamientos as alo ON res.alojamientoID=alo.ID
        INNER JOIN usuarios as usu ON alo.usuarioID=usu.ID
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

server.get('/perfil/mis-reservas/alojamientos/activas', comprobarToken, (req, res) => {
    
    if (req.userId == undefined) {
        res.status(500).json({ respuesta: 'err_user' });
        return;
    }

    mysql.query(`SELECT res.*,alo.ubicacion,alo.valoracionMedia,alo.vecesValorado,usu.nombre,usu.residencia,usu.fechaReg FROM usuarios_reservas as res 
        INNER JOIN alojamientos as alo ON res.alojamientoID=alo.ID AND alo.usuarioID=?
        INNER JOIN usuarios as usu ON usu.ID=res.usuarioID
        WHERE res.valoraHospedador=-1 AND res.estado!=-1 ORDER BY res.creadoEn DESC`, req.userId, function (err, result) {

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

server.get('/perfil/mis-reservas/alojamientos/antiguas', comprobarToken, (req, res) => {
    
    if (req.userId == undefined) {
        res.status(500).json({ respuesta: 'err_user' });
        return;
    }

    
    mysql.query(`SELECT res.*,alo.ubicacion,alo.valoracionMedia,alo.vecesValorado,usu.nombre,usu.residencia,usu.fechaReg FROM usuarios_reservas as res 
        INNER JOIN alojamientos as alo ON res.alojamientoID=alo.ID AND alo.usuarioID=?
        INNER JOIN usuarios as usu ON usu.ID=res.usuarioID
        WHERE res.valoraHospedador!=-1 OR res.estado=-1 ORDER BY res.creadoEn DESC`, req.userId, function (err, result) {

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

server.get('/perfil/mis-reservas/alojamientos/cancelar/:id', comprobarToken, (req, res) => {

    if (req.userId == undefined) {
        res.status(500).json({ respuesta: 'err_user' });
        return;
    }

    const reservaID = req.params.id;

    mysql.query('UPDATE usuarios_reservas SET estado=-1 WHERE ID=? LIMIT 1', reservaID, function (err) {
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

server.get('/perfil/mis-reservas/alojamientos/aceptar/:id', comprobarToken, (req, res) => {

    if (req.userId == undefined) {
        res.status(500).json({ respuesta: 'err_user' });
        return;
    }

    const reservaID = req.params.id;

    mysql.query('UPDATE usuarios_reservas SET estado=1 WHERE ID=? LIMIT 1', reservaID, function (err) {
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

server.get('/perfil/mis-reservas/ganancias/:id', comprobarToken, (req, res) => {
    
    if (req.userId == undefined) {
        res.status(500).json({ respuesta: 'err_user' });
        return;
    }

    const mesBuscar = req.params.id;

    //

    var fecha = new Date();

    if(mesBuscar !== 'undefined') {
        var [crearMes, crearYear] = mesBuscar.split('-');
        fecha = new Date(crearYear, crearMes, 0);
    }

    const mes = fecha.getMonth() + 1;
    const year = fecha.getFullYear();
    const primerDia = new Date(year, mes - 1, 1);
    const ultimoDia = fecha;

    //

    var queryStr = 'SELECT res.ID,res.costeTotal,res.precioBase,res.fechaEntrada,res.fechaSalida,usu.ID as usuarioID,usu.nombre,usu.apellidos,usu.residencia FROM usuarios_reservas as res ';
    queryStr += 'INNER JOIN alojamientos as alo ON alo.ID=res.alojamientoID ';
    queryStr += 'INNER JOIN usuarios as usu ON usu.ID=alo.usuarioID ';

    queryStr += 'WHERE res.creadoEn BETWEEN "' +year+ '-' +mes+ '-1" AND "' +year+ '-' +mes+ '-' +ultimoDia.getDate()+ '" ';
    queryStr += 'AND usu.ID=' +req.userId+ ' AND estado>0';

    mysql.query(queryStr, function(err, result) {
        if (err) {
            res.status(500).json({ respuesta: 'err_db' });
            console.log(err.message);
            return;
        }

        const mesNombre = fecha.toLocaleString('default', { month: 'long' });
        
        const fechaAnterior = new Date(primerDia);
        fechaAnterior.setMonth(primerDia.getMonth() - 1);
        const mesAnteriorNombre = fechaAnterior.toLocaleString('default', { month: 'long' });

        const fechaSiguiente = new Date(primerDia);
        fechaSiguiente.setMonth(primerDia.getMonth() + 1);

        var mesSiguienteNombre = '';
        
        if(new Date().getTime() > fechaSiguiente.getTime()) {
            mesSiguienteNombre = fechaSiguiente.toLocaleString('default', { month: 'long' });
        }

        //

        const len = result.length;
        var totalGanancias = 0;
        var clienteNombre = '';
        var clienteResidencia = '';
        var clienteID = 0;

        var reservasArray = [];

        if(len > 0) {

            clienteID = result[0].usuarioID;
            clienteNombre = result[0].nombre+ ' ' +result[0].apellidos;
            clienteResidencia = result[0].residencia;

            for(var i = 0; i < len; i++) {
                totalGanancias += result[i].costeTotal;

                var objeto = {
                    ID: result[i].ID,
                    costeTotal: result[i].costeTotal,
                    precioBase: result[i].precioBase,
                    dias: utils.diasEntreFechas(new Date(result[i].fechaEntrada), new Date(result[i].fechaSalida)),
                };
                reservasArray.push(objeto);
            }

        }

        //

        res.status(200).json({ 
            respuesta: 'correcto', 

            mesInfo: {
                mes: mesNombre.toUpperCase(),
                year: year,
                primerDia: primerDia.toLocaleString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' }),
                ultimoDia: ultimoDia.toLocaleString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' }),
        
                mesAnterior: mesAnteriorNombre.toUpperCase(),
                mesAnteriorNumero: fechaAnterior.getMonth() + 1,
                yearAnteriorNumero: fechaAnterior.getFullYear(),
        
                mesSiguiente: mesSiguienteNombre.toUpperCase(),
                mesSiguienteNumero: fechaSiguiente.getMonth() + 1,
                yearSiguienteNumero: fechaSiguiente.getFullYear(),

                clienteNombre: clienteNombre,
                clienteID: clienteID,
                clienteResidencia: clienteResidencia,

                reservas: len,
                totalGanancias: totalGanancias,
            },

            reservasInfo: reservasArray,
        });
    });
});

server.post('/perfil/mis-ganancias/descargar', comprobarToken, (req, res) => {
    
    if (req.userId == undefined) {
        res.status(500).json({ respuesta: 'err_user' });
        return;

    }

    var nombreFile = req.userId+ '_' +req.body.mesNombre+ '_' +req.body.mesYear+ '.pdf';

    // GENERAR FACTURA
    
    const doc = new PDFDocument();
    const writeStream = fs.createWriteStream('./facturas/' +nombreFile);
    doc.pipe(writeStream);

    doc.image('./imagenes/logo.png', (doc.page.width - 200) / 2, 0);
    
    doc.fontSize(20).text(req.body.mesNombre+ ' DE ' +req.body.mesYear, 50, 150);
    doc.fillColor('grey').fontSize(10).text(req.body.primerDia+ ' - ' +req.body.ultimoDia);

    doc.fillColor('black');
    doc.fontSize(13);
    doc.text('FastForHolidays\n49028, Zamora\nEspaña', 50, 200);

    doc.text(`Web: www.fastforholidays.es\nE-mail: info@fastforholidays.com\nTel: +34 642444231`, 350, 200);
    
    doc.lineCap('butt')
        .moveTo(50, 260)
        .lineTo(550, 260)
        .fillAndStroke("blue", "blue")
        .stroke();
    
    doc.fillColor('black');
    doc.fontSize(20).text('FACTURA', 50, 280);

    doc.fontSize(13).text(req.body.clienteNombre+ '\n' +req.body.clienteResidencia+ '\n214141412X', 50, 320);

    // TABLA

    doc.lineJoin('miter').rect(50, 380, 500, 20).stroke('black');

    doc.text('ID', 90, 385);
    doc.text('Info', 250, 385);
    doc.text('Coste', 450, 385);

    const lenReservas = req.body.reservas.length;

    doc.lineJoin('miter').rect(50, 400, 500, 20 + 22 * lenReservas).stroke();

    for(var i = 0; i < lenReservas; i++) {
        doc.text(req.body.reservas[i].ID, 90, 407 + 22 * i);
        doc.text(req.body.reservas[i].dias+ ' días x ' +req.body.reservas[i].precioBase+ '€', 250, 407 + 22 * i);
        doc.text(req.body.reservas[i].costeTotal+ '€', 450, 407 + 22 * i);
    }

    doc.lineJoin('miter').rect(50, 400 + 22 * lenReservas, 500, 20).stroke();
    
    doc.text('Total', 90, 407 + 22 * lenReservas);
    doc.text(req.body.totalGanancias+ '€', 450, 407 + 22 * lenReservas);

    doc.end();

    //

    writeStream.on('finish', function () {
        var file = fs.readFileSync('./facturas/' +nombreFile, 'binary', function(err) {
            console.log(err);
            return;
        });
    
        res.set({ 'Content-Type': 'application/pdf', 'Content-Length': file.length });
        res.write(file, 'binary')
        res.end();
    });
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

    mysql.query('INSERT INTO usuarios_valoraciones (usuarioID, userValoradoID, tipo, mensaje) VALUES (?)', 
    [
        [
            req.userId,
            req.body.usuarioID,
            utils.boolToInt(req.body.tipo),
            req.body.mensaje,
        ]
    ], function(err, result) {

        if (err) {
            res.status(500).json({ respuesta: 'err_db' });
            console.log(err.message);
            return;
        }

        // ACTUALIZAR RESERVA

        var valoracionId = result.insertId;
        mysql.query('UPDATE usuarios_reservas SET valoraHospedador=? WHERE ID=?', [valoracionId, req.body.reservaID]);

        //

        res.status(200).json({ respuesta: 'correcto', userValoracion: valoracionId });
    });
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

//

server.get('/perfil/mis-valoraciones/hechas-alo/:id', comprobarToken, async (req, res) => {

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

server.get('/perfil/mis-valoraciones/hechas-user/:id', comprobarToken, async (req, res) => {

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

server.get('/perfil/mis-valoraciones/recibidas-alo/:id', comprobarToken, async (req, res) => {

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

server.get('/perfil/mis-valoraciones/recibidas-user/:id', comprobarToken, async (req, res) => {

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

//

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

            var ultimaConexion = new Date(result[i].ultimaConexion);
            var ultimaVez = utils.diasEntreFechas(ultimaConexion.getTime(), fechaHoy);

            var textoUltimaConexion = '';

            if(ultimaVez <= 1) {
                textoUltimaConexion = 'Hoy a las ' + ultimaConexion.toLocaleTimeString('es-Es', { hour: '2-digit', minute: '2-digit'});

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

        // SERVICIOS

        const servicios = result[0].servicios;
        const lenServicios = utils.serviciosCasas.length;

        for(var i = 0; i < lenServicios; i++) {
            result[0][utils.serviciosCasas[i].toLowerCase()] = servicios >> (utils.totalServicios-i) & 0x1;
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
    });
});

server.get('/alojamiento/imagen/:id', (req, res) => {

    const [id, index] = req.params.id.split('-');

    mysql.query("SELECT nombre FROM alojamientos_img WHERE alojamientoID=? LIMIT ?, 1", [id, parseInt(index)], (err, result) => {

        if (err) {
            res.status(500).json({ respuesta: 'err_db' });
            console.log(err.message);
            return;
        }

        if (result.length === 0) {
            res.status(500).json({ respuesta: 'err_db' });
            return;
        }

        fs.readFile('./imagenes/casas/' +result[0].nombre, function (err, file) {

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

    mysql.query('SELECT fechaEntrada,fechaSalida FROM usuarios_reservas WHERE alojamientoID=? AND fechaEntrada >= CURDATE() AND (estado=0 OR estado=1)', alojamientoId,
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

server.get('/alojamiento/reservar/:id', comprobarToken, (req, res) => {

    if (req.userId == undefined) {
        res.status(500).json({ respuesta: 'err_user' });
        return;
    }

    const alojamientoId = req.params.id;

    mysql.query('SELECT ID,ubicacion,precio,valoracionMedia,vecesValorado FROM alojamientos WHERE ID=? LIMIT 1', alojamientoId, function (err, result) {
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

server.post('/alojamiento/reservar', comprobarToken, async (req, res) => {

    if (req.userId == undefined) {
        res.status(500).json({ respuesta: 'err_user' });
        return;
    }

    try {

        let request = new paypal.orders.OrdersCreateRequest();
        const precioTotal = parseFloat(req.body.noches * req.body.precioBase).toFixed(2) * 1.00;

        //
        
        request.prefer("return=representation");
        request.requestBody({
            intent: "CAPTURE",

            purchase_units: [{
                description: "Pago para la compañía FastForHolidays",
                soft_descriptor: "Alquiler de casas",

                amount: {
                    currency_code: "EUR",
                    value: precioTotal, 
                    breakdown: {
                        item_total: {
                            currency_code: "EUR",
                            value: precioTotal,
                        },
                    },
                },
                items: [
                    {
                        name: 'noches',
                        unit_amount: {
                            currency_code: 'EUR',
                            value: Number.parseFloat(req.body.precioBase).toFixed(2) * 1.00,
                        },
                        quantity: Number.parseFloat(req.body.noches).toFixed(2) * 1.00,
                    }
                ]
            }, ],
        });

        //

        const order = await paypalClient.execute(request);
        res.status(200).json({ respuesta: 'correcto', orderID: order.result.id });

    } catch(e) {
        res.status(500).json({ respuesta: 'err_paypal' });
        console.log(e)
    }
});

server.post('/alojamiento/reservar/aceptada', comprobarToken, async (req, res) => {

    if (req.userId == undefined) {
        res.status(500).json({ respuesta: 'err_user' });
        return;
    }

    const orderID = req.body.orderID;
    const request = new paypal.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});

    try {
        const capture = await paypalClient.execute(request);

        if(capture.result.status !== 'COMPLETED') {
            res.status(500).json({ respuesta: 'err_paypal' });
            return;
        }

        mysql.query('INSERT INTO usuarios_reservas (usuarioID, alojamientoID, fechaEntrada, fechaSalida, costeTotal, numeroViajeros, numeroMascotas, pagoID, precioBase) VALUES (?)',
        [
            [
                req.userId,
                req.body.alojamientoID,
                req.body.fechaEntrada,
                req.body.fechaSalida,
                req.body.costeTotal,
                req.body.personas,
                req.body.mascotas,
                capture.result.id,
                req.body.precioBase
            ]

        ], function (err) {

             if (err) {
                res.status(500).json({ respuesta: 'err_db' });
                console.log(err.message);
                return;
            }

            res.status(200).json({ respuesta: 'correcto' });

            // ENVIAR CORREO AL DUEÑO

            mysql.query(`SELECT alo.ubicacion, alo.titulo, usu.email FROM alojamientos as alo
                INNER JOIN usuarios as usu ON usu.ID=alo.usuarioID
                WHERE alo.ID=?`, 
                [
                    req.body.alojamientoID
                ], 
                function(err, result) {

                    if(err || result.length === 0) {
                        return;
                    }

                    try {

                        var textoEmail = 'Hola, parece que uno de tus alojamientos ha sido reservado por ' +req.body.noches+ ' noches.\n\n';
                        textoEmail += 'Título: ' +result[0].titulo+ '\n';
                        textoEmail += 'Ubicación: ' +result[0].ubicacion+ '\n';
                        textoEmail += 'Reserva: ' +req.body.noches+ ' noches X ' +req.body.precioBase+'€\n';
                        textoEmail += 'Coste total: ' +req.body.costeTotal+ '€\n';
                        textoEmail += '\n\nUn saludo desde 2FH.'
        
                        email.sendMail({
                            from: 'FastForHolidays',
                            to: (dev_state === true) ? 'pepecortezri@gmail.com' : result[0].email,
                            subject: '¡Uno de tus alojamientos ha sido reservado!',
                            text: textoEmail
                        });
        
                    } catch (err) {
                        console.log(err);
                    }
                }
            );
        });

    } catch (err) {
        res.status(500).json({ respuesta: 'err_paypal' });
    }
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
        queryStr = 'SELECT * FROM alojamientos as alo WHERE alo.usuarioID!=0 ';

    } else {
        queryStr = 'SELECT alo.*, fav.ID as favorito FROM `alojamientos` as alo ';
        queryStr += 'LEFT JOIN `usuarios_favoritos` as fav ON fav.alojamientoID=alo.ID AND fav.usuarioID=' + req.userId + ' ';
        queryStr += 'WHERE alo.usuarioID!=' + req.userId + ' ';
    }

    // FILTROS

    queryStr += utils.queryFiltros(req.body.filtros);

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
            console.log(err);
            console.log(err.message);
            return;
        }

        res.status(200).json({ respuesta: 'correcto', busqueda: result });
    });
});

server.post('/home', comprobarToken, (req, res) => {

    var queryStr = '';

    if (req.userId == undefined) {
        queryStr += 'SELECT * FROM alojamientos as alo WHERE alo.usuarioID!=0 ';

    } else {
        queryStr += 'SELECT alo.*, fav.ID as favorito FROM `alojamientos` as alo ';
        queryStr += 'LEFT JOIN `usuarios_favoritos` as fav ON fav.alojamientoID=alo.ID AND fav.usuarioID=' + req.userId + ' ';
        queryStr += 'WHERE alo.usuarioID!=' + req.userId + ' ';
    }

    // FILTROS

    queryStr += utils.queryFiltros(req.body.filtros);

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

server.post('/alojamientos/filtros', (req, res) => {

    var queryStr = 'SELECT * FROM alojamientos WHERE ';

    // FILTROS

    const filtros = req.body.filtros;

    if(filtros.precio_min !== null) {
        queryStr += 'precio BETWEEN ' +parseInt(filtros.precio_min)+ ' AND ' +parseInt(filtros.precio_max)+ ' ';
    }

    if(filtros.viajeros !== null) {
        queryStr += 'AND viajeros>=' +parseInt(filtros.viajeros)+ ' ';
    }

    if(filtros.habitaciones !== null) {
        queryStr += 'AND habitaciones>=' +parseInt(filtros.habitaciones)+ ' ';
    }

    if(filtros.camas !== null) {
        queryStr += 'AND camas>=' +parseInt(filtros.camas)+ ' ';
    }

    if(filtros.aseos !== null) {
        queryStr += 'AND aseos>=' +parseInt(filtros.aseos)+ ' ';
    }

    // VALORACION

    if(filtros.valoracion !== null && filtros.valoracion > 0) {
        queryStr += 'AND valoracionMedia>' +parseInt(filtros.valoracion)+ ' ';
    }  

    //

    mysql.query(queryStr, function(err, result) {
        res.status(200).json({ respuesta: 'correcto', cantidad: result === undefined ? 0 : result.length });
    });
});

//

server.use('/birds', comprobarToken, require('./routes/home'));
server.use('/cookies', require('./routes/cookies'));
server.use('/cuenta', comprobarToken, require('./routes/cuenta'));