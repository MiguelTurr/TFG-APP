const express = require('express');
const router = express.Router();

//

const mysql = require('../services/mysql.js');
const email = require("../services/email.js");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const randomstring = require("randomstring");

const { bcrypt_salt, cookie_secret, dev_state } = require('../services/config.js');

//

router.post('/registrar', async (req, res) => {

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
                texto += 'http://localhost:3000/validar/' + validarEmail;
                texto += '\n\nUn saludo desde 2FH.'

                email.sendMail({
                    from: 'FastForHolidays',
                    to: (dev_state === true) ? 'pepecortezri@gmail.com' : req.body.email,
                    subject: 'Código de verificación - 2FH',
                    text: texto
                });

                res.status(201).json({ respuesta: 'correcto' });

            } catch (err) {
                res.status(401).json({ respuesta: 'err_envia_correo' });
            }
        }
    );
});

router.post('/login', (req, res) => {

    const userEmail = req.body.email;
    const userPassword = req.body.password;

    mysql.query("SELECT ID,password,activo,nombre FROM usuarios WHERE email=? LIMIT 1", userEmail, async (err, result) => {

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

        //

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

router.post('/logout', (_, res) => {
    res.status(200).clearCookie("token");
    res.end();
});

router.post('/recordar-password', (req, res) => {

    const emailRequest = req.body.email;

    mysql.query("SELECT passReset,nombre FROM usuarios WHERE email=? AND activo=1 LIMIT 1", emailRequest, async (err, result) => {

        if (err) {
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
                    to: (dev_state === true) ? 'pepecortezri@gmail.com' : emailRequest,
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

router.get('/validar/:id', (req, res) => {

    const verificacion = req.params.id;

    mysql.query("SELECT * FROM usuarios WHERE activo=0 AND verificacion=? LIMIT 1", verificacion, async (err, result) => {

        if (err) {
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
                console.log(err.message);
                res.status(500).json({ respuesta: 'err_db' });
                return;
            }

            res.status(201).json({ respuesta: 'correcto' });
        });
    });
});

module.exports = router