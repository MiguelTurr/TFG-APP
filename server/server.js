const express = require('express');
const cors = require('cors');
const mysql = require("./services/mysql.js");
const email = require("./services/email.js");

const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const bcrypt = require('bcrypt');
const randomstring = require("randomstring");

const { bcrypt_salt, cookie_secret } = require('./services/config.js');

//

const server = express();

server.use(express.json({limit: '50mb'}));
server.use(express.urlencoded({ extended: true, limit: '50mb' }));

server.use(express.json());
server.use(cookieParser(
    //secret: your_secret,
));

server.use(cors({
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST']
}));

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

server.get('/cookies', (req, res) => {

});

server.get('/cookies/aceptar', (req, res) => {
    res.status(200).cookie('cookiesAceptadas', true, { httpOnly: false, expires: new Date(2147483647222222), secure: false, sameSite: true }).end();
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
        .cookie('token', token, { httpOnly: true, expires: new Date(Date.now() + 10000000), secure: true })
        .json({ respuesta: 'correcto', autorizacion: true });
    });
});

server.post('/logout', comprobarToken, (req, res) => {
    res.status(200).clearCookie("token");
    res.end();
});

server.post('/noPassword', (req, res) => {

    const email = req.body.email;

    mysql.query("SELECT passReset FROM usuarios WHERE email=? AND activo=1 LIMIT 1", email, async (err, result) => {

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

        const fechaHoy = new Date().getTime();
        const fechaReset = new Date(result[0].passReset).getTime();

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

        mysql.query("UPDATE usuarios SET password=?,passReset=? WHERE email=? LIMIT 1", passwordHash, nuevoReset, email, function(err) {

            if(err) {
                console.log(err);
                console.log(err.message);
    
                res.status(500).json({ respuesta: 'err_db' });
                return;
            }

            try {

                var texto = 'Hola la contraseña vinculada a este correo ha sido reseteada correctamente:';
                texto += '\n\n';
                texto += 'Nueva contraseña: ' +nuevaPassword;
                texto += '\n\nUn saludo desde 2FH.'

                email.sendMail({
                    to: req.body.email,
                    subject: 'Cambio de contraseña - 2FH',
                    text: texto
                });

                res.status(201).json({ respuesta: 'correcto' });
            
            } catch(err) {
                res.status(401).json({ respuesta: 'err_envia_correo' });
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

        console.log(result);
        res.status(201).json({ usuario: result });
    });
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