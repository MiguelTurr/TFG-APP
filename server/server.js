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
const { bcrypt_salt, cookie_secret } = require('./services/config.js');

//

const server = express();

server.use(express.json({limit: '50mb'}));
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

server.listen(port, function() {
    console.log(`El servidor se está ejecutando en http://${hostname}:${port}/`);
});

//

const comprobarToken = (req, _, next) => {

    const token = req.cookies.token;

    if(token) {
        try {
            const decoded = jwt.verify(token, cookie_secret);
            req.userId = decoded.id;

        } catch(err) {
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

        if(err) {

            console.log(err);
            console.log(err.message);

            if(err.code == 'ER_DUP_ENTRY') {
                res.status(500).json({ respuesta: 'err_email' });
                return;
            }

            res.status(500).json({ respuesta: 'err_db' });
            return;
        }

        // CORREO VERIFICACIÓN

        try {

            var texto = 'Hola '+req.body.nombre+ ' ' +req.body.apellidos+ ', su cuenta se ha creado correctamente, para verificarla pulsa el siguiente link:';
            texto += '\n\n';
            texto += 'localhost:3000/validar/' +validarEmail;
            texto += '\n\nUn saludo desde 2FH.'

            email.sendMail({
                from: 'FastForHolidays',
                to: req.body.email,
                subject: 'Código de verificación - 2FH',
                text: texto
            });

            res.status(201).json({ respuesta: 'correcto' });
        
        } catch(err) {
            res.status(401).json({ respuesta: 'err_envia_correo' });
        }
    });
});

server.post('/login', (req, res) => {

    const userEmail = req.body.email;
    const userPassword = req.body.password;

    mysql.query("SELECT * FROM usuarios WHERE email=? LIMIT 1", userEmail, async (err, result) => {

        if(err) {
            console.log(err);
            console.log(err.message);

            res.status(500).json({ respuesta: 'err_db' });
            return;
        }

        if(result.length == 0) {
            res.status(401).json({ respuesta: 'err_datos' });
            return;
        }

        const match = await bcrypt.compare(userPassword, result[0].password);
        if(!match) {
            res.status(401).json({ respuesta: 'err_datos' });
            return;
        }

        if(result[0].activo == 0) {
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

        if(err) {
            console.log(err);
            console.log(err.message);

            res.status(500).json({ respuesta: 'err_db' });
            return;
        }

        if(result.length == 0) {
            res.status(401).json({ respuesta: 'err_datos' });
            return;
        }

        const fechaHoy = new Date().getTime() / 1000;
        const fechaReset = result[0].passReset;

        if(fechaReset > fechaHoy) {
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

        mysql.query("UPDATE usuarios SET password=?,passReset=? WHERE email=? LIMIT 1", [passwordHash, nuevoReset, emailRequest], function(err) {

            if(err) {
                console.log(err);
                console.log(err.message);
    
                res.status(500).json({ respuesta: 'err_db' });
                return;
            }

            try {

                var texto = 'Hola ' +userNombre+ ', la contraseña vinculada a este correo ha sido reseteada correctamente:';
                texto += '\n\n';
                texto += 'Nueva contraseña: ' +nuevaPassword;
                texto += '\n\nUn saludo desde 2FH.'

                email.sendMail({
                    to: emailRequest,
                    subject: 'Cambio de contraseña - 2FH',
                    text: texto
                });

                res.status(201).json({ respuesta: 'correcto' });
            
            } catch(err) {
                res.status(401).json({ respuesta: 'err_envia_correo' });
                console.log(err);
            }
        })
    });
});

server.get('/validar/:id', (req, res) => {

    const verificacion = req.params.id;

    mysql.query("SELECT * FROM usuarios WHERE activo=0 AND verificacion=? LIMIT 1", verificacion, async (err, result) => {

        if(err) {
            console.log(err);
            console.log(err.message);
            
            res.status(500).json({ respuesta: 'err_db' });
            return;
        }

        if(result.length == 0) {
            res.status(401).json({ respuesta: 'err_datos' });
            return;
        }

        mysql.query("UPDATE usuarios SET activo=1 WHERE activo=0 AND verificacion=? LIMIT 1", verificacion, async (err) => {

            if(err) {
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

    if(req.userId == undefined) {
        res.status(500).json({ respuesta: 'err_user' });
        return;
    }

    mysql.query("SELECT * FROM usuarios WHERE ID=? LIMIT 1", req.userId, (err, result) => {
        if(err) {
            res.status(500).json({ respuesta: 'err_db' });

            console.log(err.message);
            return;
        }

        res.status(201).json({ 
            nombre: result[0].nombre,
            apellidos: result[0].apellidos,
            fechaNac: result[0].fechaNac,
            genero: result[0].genero == 0 ? 'Hombre' : 'Mujer',
            telefono: result[0].telefono,
            residencia: result[0].residencia,
            presentacion: result[0].presentacion,

            fechaReg: result[0].fechaReg,
            email: result[0].email,
            imagenPerfil: result[0].imgPerfil,
        });
    });
});

server.post('/perfil/editar', comprobarToken, (req, res) => {

    if(req.userId == undefined) {
        res.status(500).json({ respuesta: 'err_user' });
        return;
    }

    mysql.query("SELECT password FROM usuarios WHERE ID=? LIMIT 1", req.userId, async (err, result) => {
        
        if(err) {
            res.status(500).json({ respuesta: 'err_db' });
            console.log(err.message);
            return;
        }

        if(result.length == 0) {
            res.status(500).json({ respuesta: 'err_user' });
            return;
        }

        const match = await bcrypt.compare(req.body.password, result[0].password);
        if(!match) {
            res.status(401).json({ respuesta: 'err_datos' });
            return;
        }

        //

        var query = 'UPDATE usuarios SET ';

        var datoEditado = req.body.editado;
        if(req.body.tipo == 'password') {
            datoEditado = await bcrypt.hash(datoEditado, bcrypt_salt);

        } else if(req.body.tipo == 'imagen') {
            const extension = req.body.editado.split('.')[1];
            datoEditado = utils.nombreFotoPerfil(req.userId, extension);

            req.body.tipo = 'imgPerfil';
        }

        query += req.body.tipo+ '="' +datoEditado+ '" ';
        query += 'WHERE ID=' +req.userId+ ' LIMIT 1';
        
        mysql.query(query, function(err, result) {
            if(err) {
                res.status(500).json({ respuesta: 'err_db' });
    
                console.log(err.message);
                return;
            }
    
            if(result.affectedRows == 0) {
                res.status(500).json({ respuesta: 'err_datos' });
                return;
            }

            if(req.files != undefined) {
                const avatar = req.files.imagen;
                avatar.mv('./imagenes/perfil/' +datoEditado);
            }

            res.status(200).json({ respuesta: 'correcto' });
        });
    });
});

server.post('/perfil/borrar', comprobarToken, (req, res) => {

    if(req.userId == undefined) {
        res.status(500).json({ respuesta: 'err_user' });
        return;
    }

    var query = 'UPDATE usuarios SET ';

    if(req.body.tipo == 'imagen') {

        query += "imgPerfil='default.png' ";

        fs.unlink('./imagenes/perfil/' +req.body.borrar, (err) => {
            if(err) {
                res.status(500).json({ respuesta: 'err_server' });

                console.log(err);
                return;
            }
        });
    }

    query += 'WHERE ID=' +req.userId+ ' LIMIT 1';

    mysql.query(query, function(err) {

        if(err) {
            res.status(500).json({ respuesta: 'err_db' });

            console.log(err.message);
            return;
        }

        res.status(200).json({ respuesta: 'correcto' });
    });
});

server.get('/perfil/foto', comprobarToken, (req, res) => {

    if(req.userId == undefined) {
        res.status(500).json({ respuesta: 'err_user' });
        return;
    }

    mysql.query("SELECT imgPerfil FROM usuarios WHERE ID=? LIMIT 1", req.userId, (err, result) => {

        if(err) {
            res.status(500).json({ respuesta: 'err_db' });
            console.log(err.message);
            return;
        }
        
        const imagen = result[0].imgPerfil;

        fs.readFile('./imagenes/perfil/' +imagen, function(err, file) {

            if(err) {
                res.status(500).json({ respuesta: 'err_file' });
                return;
            }

            res.set({'Content-Type': 'image/jpg'});
            res.end(file);
        });
    });
});

server.get('/perfil/eliminar', comprobarToken, (req, res) => {

    if(req.userId == undefined) {
        res.status(500).json({ respuesta: 'err_user' });
        return;
    }

    mysql.query('DELETE FROM usuarios WHERE ID=? LIMIT 1', req.userId, function(err) {

        if(err) {
            res.status(500).json({ respuesta: 'err_db' });
            console.log(err.message);
            return;
        }

        res.status(200).clearCookie("token").json({ respuesta: 'correcto' });
    })
});

server.get('/perfil/misalojamientos', comprobarToken, (req, res) => {

    if(req.userId == undefined) {
        res.status(500).json({ respuesta: 'err_user' });
        return;
    }

    mysql.query('SELECT * FROM alojamientos WHERE usuarioID=? ORDER BY creadoEn DESC', req.userId, function(err, result) {
        if(err) {
            res.status(500).json({ respuesta: 'err_db' });

            console.log(err.message);
            return;
        }

        for(var i = 0; i < result.length; i++) {
            result[i].valoraciones = 2.5;
        }

        res.status(200).json({ respuesta: 'correcto', alojamientos: result });
    });
});

server.post('/perfil/misalojamientos/crear', comprobarToken, (req, res) => {

    if(req.userId == undefined) {
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
    
    mysql.query('INSERT INTO alojamientos (usuarioID, titulo, descripcion, precio, ubicacion, lat, lng, viajeros, habitaciones, camas, aseos, horaEntrada, horaSalida, puedeFumar, puedeFiestas, servicios) VALUES (?)', 
    [
        [
            req.userId,
            req.body.titulo,
            req.body.descripcion,
            parseInt(req.body.precio),
            req.body.ubicacion,
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
        if(err) {
            res.status(500).json({ respuesta: 'err_db' });

            console.log(err.message);
            return;
        }

        const alojamientoId = result.insertId;

        var arrayNombreImagenes = [];

        const imagenLen = req.files.imagen.length;
        if(imagenLen === undefined) {

            const file = req.files.imagen;

            const extension = file.name.split('.')[1];
            const nombreFile = utils.nombreFotoAlojamiento(alojamientoId, 0, extension);
            
            file.mv('./imagenes/casas/' +nombreFile);

            arrayNombreImagenes.push([alojamientoId, nombreFile]);

        } else {

            for(var i = 0; i < imagenLen; i++) {

                const file = req.files.imagen[i];

                const extension = file.name.split('.')[1];
                const nombreFile = utils.nombreFotoAlojamiento(alojamientoId, i, extension);
                
                file.mv('./imagenes/casas/' +nombreFile);

                arrayNombreImagenes.push([alojamientoId, nombreFile]);
            }
        }
        
        mysql.query('INSERT INTO alojamientos_img (alojamientoID, nombre) VALUES ?', [arrayNombreImagenes]);

        //

        res.status(200).json({ respuesta: 'correcto', alojamientoId: alojamientoId });

    });
});

server.post('/perfil/misalojamientos/editar/:id', comprobarToken, (req, res) => {

    if(req.userId == undefined) {
        res.status(500).json({ respuesta: 'err_user' });
        return;
    }

    //console.log(req.body);
});

server.get('/perfil/favoritos', comprobarToken, (req, res) => {

    if(req.userId == undefined) {
        res.status(500).json({ respuesta: 'err_user' });
        return;
    }

    mysql.query('SELECT alo.* FROM `usuarios_favoritos` as fav INNER JOIN `alojamientos` as alo ON fav.alojamientoID=alo.ID WHERE fav.usuarioID=?', req.userId, function(err, result) {

        if(err) {
            res.status(500).json({ respuesta: 'err_db' });

            console.log(err.message);
            return;
        }
        
        res.status(200).json({ respuesta: 'correcto', alojamientos: result });
    });
});

//

server.get('/alojamiento/hospedador/:id', (req, res) => {

    const hospedadorId = req.params.id;

    mysql.query('SELECT * FROM usuarios WHERE ID=? LIMIT 1', hospedadorId, function(err, result) {

        if(err) {
            res.status(500).json({ respuesta: 'err_db' });

            console.log(err.message);
            return;
        }

        if(result.length == 0) {
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

        if(err) {
            res.status(500).json({ respuesta: 'err_db' });
            console.log(err.message);
            return;
        }
        
        const imagen = result[0].imgPerfil;

        fs.readFile('./imagenes/perfil/' +imagen, function(err, file) {

            if(err) {
                res.status(500).json({ respuesta: 'err_file' });
                return;
            }

            res.set({'Content-Type': 'image/jpg'});
            res.end(file);
        });
    });
});

server.get('/alojamiento/valoraciones/:id', (req, res) => {

    const id = req.params.id;

    console.log('VALORACIONES: ' +id);

    var arrayValoraciones = {
        valLlegada: 3.5,
        valVeracidad: 4.5,
        valComunicacion: 2.2,
        valUbicacion: 5.0,
        valLimpieza: 4.9,
        valCalidad: 2.0,

        valMedia: 4.4,
        valComentarios: 200,
    };

    res.status(200).json({ respuesta: 'correcto', valoraciones: arrayValoraciones });
});

server.get('/alojamiento/add-favorito/:id', comprobarToken, (req, res) => {

    const alojamientoId = req.params.id;

    if(req.userId == undefined) {
        res.status(500).json({ respuesta: 'err_user' });
        return;
    }

    mysql.query('INSERT INTO usuarios_favoritos (usuarioID, alojamientoID) VALUES (?)', [
        [
            req.userId,
            parseInt(alojamientoId)
        ]
    ], function(err) {

            if(err) {
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

    const alojamientoId = req.params.id;

    if(req.userId == undefined) {
        res.status(500).json({ respuesta: 'err_user' });
        return;
    }

    mysql.query('DELETE FROM usuarios_favoritos WHERE usuarioID=? AND alojamientoID=?', [ req.userId, parseInt(alojamientoId) ], function(err) {

         if(err) {
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

    if(req.userId === undefined) {
        queryStr += 'SELECT * FROM alojamientos WHERE ID=? LIMIT 1';

    } else {
        queryStr = 'SELECT alo.*, fav.ID as favorito FROM alojamientos as alo \
        LEFT JOIN usuarios_favoritos as fav ON fav.alojamientoID=alo.ID AND fav.usuarioID=' +req.userId+ ' \
        WHERE alo.ID=? LIMIT 1';
    }

    mysql.query(queryStr, id, (err, result) => {

        if(err) {
            res.status(500).json({ respuesta: 'err_db' });
            console.log(err.message);
            return;
        }

        if(result.length == 0) {
            
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

        if(result[0].favorito === undefined) {
            result[0].favorito = null;
        }

        var entrada = result[0].horaEntrada;
        var salida = result[0].horaSalida;

        if(entrada != null) {
            result[0].horaEntrada = entrada.substring(0, 5);
        }

        if(salida != null) {
            result[0].horaSalida = salida.substring(0, 5);
        }

        res.status(200).json({ respuesta: 'correcto', alojamiento: result });

        mysql.query('UPDATE alojamientos SET visitas=? WHERE ID=? LIMIT 1', [result[0].visitas + 1, result[0].ID]);
    });
});

server.get('/alojamiento/imagen/:id', (req, res) => {

    const [ id, index ] = req.params.id.split('-');

    mysql.query("SELECT nombre FROM alojamientos_img WHERE alojamientoID=?", id, (err, result) => {

        if(err) {
            res.status(500).json({ respuesta: 'err_db' });
            console.log(err.message);
            return;
        }
        
        const imagen = result[index].nombre;

        fs.readFile('./imagenes/casas/' +imagen, function(err, file) {

            if(err) {
                res.status(500).json({ respuesta: 'err_file' });
                return;
            }

            res.set({'Content-Type': 'image/*'});
            res.end(file);
        });
    });
});

//

server.post('/buscar', (req, res) => {

});

server.get('/home', comprobarToken, (req, res) => {

    var queryStr = 'SELECT * FROM alojamientos ';

    if(req.userId == undefined) {
        queryStr += 'ORDER BY creadoEn DESC ';

    } else {
        queryStr += 'WHERE usuarioID!=' +req.userId+ ' ';
        queryStr += 'ORDER BY creadoEn DESC ';
    }

    queryStr += 'LIMIT 30';

    //

    mysql.query(queryStr, function(err, result) {
        if(err) {
            res.status(500).json({ respuesta: 'err_db' });

            console.log(err.message);
            return;
        }

        for(var i = 0; i < result.length; i++) {
            result[i].valoraciones = (Math.random() * 5).toFixed(1);
            result[i].favorito = false;
        }

        res.status(200).json({ respuesta: 'correcto', alojamientos: result });
    });
});