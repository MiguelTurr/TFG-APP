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
        const decoded = jwt.verify(token, cookie_secret);
        req.userId = decoded.id;
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
            datoEditado = 'user' +req.userId+ '-profile.' +extension;

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

    res.json( { 
        "respuesta": 'correcto',
        "alojamientos": 
            [ 
                {
                    precio: 50,
                    lugar: 'Zamora, España',
                    valoraciones: 3.5,
                    creadoEn: new Date(1995, 11, 17)
                },
                {
                    precio: 10,
                    lugar: 'León, México',
                    valoraciones: 2.5,
                    creadoEn: new Date(2000, 11, 17)
                },
                {
                    precio: 10,
                    lugar: 'León, México',
                    valoraciones: 1.5,
                    creadoEn: new Date(2010, 11, 17)
                },
                {
                    precio: 10,
                    lugar: 'León, México',
                    valoraciones: 2.5,
                    creadoEn: new Date(2011, 11, 17)
                }
            ]
        });

    /*
    mysql.query('SELECT * FROM alojamientos WHERE userID=? ORDER BY creadoEn DESC', req.userId, function(err, result) {
        if(err) {
            return;
        }


    });
    */
});

server.post('/perfil/misalojamientos/crear', comprobarToken, (req, res) => {

    if(req.userId == undefined) {
        res.status(500).json({ respuesta: 'err_user' });
        return;
    }

    console.log(req.body);
    console.log(req.files.imagen.length);

    const imagenLen = req.files.imagen.length;
    for(var i = 0; i < imagenLen; i++) {
        console.log(req.files.imagen[i].name)
    }
    
    res.status(200).json({ respuesta: 'correcto' });
});

server.post('/perfil/misalojamientos/editar/:id', comprobarToken, (req, res) => {

    if(req.userId == undefined) {
        res.status(500).json({ respuesta: 'err_user' });
        return;
    }

    //console.log(req.body);
});

//

server.post('/buscar', (req, res) => {

});

server.get('/prueba', comprobarToken, (req, res) => {

    //var queryStr = '';

    if(req.userId == undefined) {

        res.json( { 
            "usuarios": 
                [ 
                    {
                        url: 'https://a0.muscache.com/im/pictures/eda1a9aa-13e1-48b1-b54b-b48cfdf4bb00.jpg?im_w=960',
                        precio: 50,
                        lugar: 'Zamora, España'
                    },
                    {
                        url: 'https://a0.muscache.com/im/pictures/eda1a9aa-13e1-48b1-b54b-b48cfdf4bb00.jpg?im_w=960',
                        precio: 10,
                        lugar: 'León, México'
                    }
                ]
            });
    } else {

        res.json( { 
            "usuarios": 
                [ 
                    {
                        nombre: 'usuario1', 
                        url: 'https://a0.muscache.com/im/pictures/eda1a9aa-13e1-48b1-b54b-b48cfdf4bb00.jpg?im_w=960',
                        precio: 200,
                        lugar: 'León, España'
                    },
                    {
                        nombre: 'usuario2',
                        url: 'https://a0.muscache.com/im/pictures/eda1a9aa-13e1-48b1-b54b-b48cfdf4bb00.jpg?im_w=960',
                        precio: 200,
                        lugar: 'León, España'
                    },
                    {
                        nombre: 'usuario3',
                        url: 'https://a0.muscache.com/im/pictures/eda1a9aa-13e1-48b1-b54b-b48cfdf4bb00.jpg?im_w=960',
                        precio: 200,
                        lugar: 'León, España'
                    },
                    {
                        nombre: 'usuario4',
                        url: 'https://a0.muscache.com/im/pictures/eda1a9aa-13e1-48b1-b54b-b48cfdf4bb00.jpg?im_w=960',
                        precio: 200,
                        lugar: 'León, España'
                    },
                    {
                        nombre: 'usuario5',
                        url: 'https://a0.muscache.com/im/pictures/eda1a9aa-13e1-48b1-b54b-b48cfdf4bb00.jpg?im_w=960',
                        precio: 200,
                        lugar: 'León, España'
                    },
                    {
                        nombre: 'usuario6',
                        url: 'https://a0.muscache.com/im/pictures/eda1a9aa-13e1-48b1-b54b-b48cfdf4bb00.jpg?im_w=960',
                        precio: 200,
                        lugar: 'León, España'
                    },
                    {
                        nombre: 'usuario7',
                        url: 'https://a0.muscache.com/im/pictures/eda1a9aa-13e1-48b1-b54b-b48cfdf4bb00.jpg?im_w=960',
                        precio: 200,
                        lugar: 'León, España'
                    },
                    {
                        nombre: 'usuario8',
                        url: 'https://a0.muscache.com/im/pictures/eda1a9aa-13e1-48b1-b54b-b48cfdf4bb00.jpg?im_w=960',
                        precio: 200,
                        lugar: 'León, España'
                    }
                ]
            });
    }
});