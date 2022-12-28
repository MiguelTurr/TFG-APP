const express = require('express');
const router = express.Router();

//

const mysql = require('../services/mysql.js');
const bcrypt = require('bcrypt');
const fs = require("fs");

const { bcrypt_salt } = require('../services/config.js');

//

router.get('/', (req, res) => {

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

        res.status(200).json({
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

router.post('/editar', (req, res) => {

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

router.post('/editar/estado', (req, res) => {

    if (req.userId == undefined) {
        res.status(500).json({ respuesta: 'err_user' });
        return;
    }

    var query = 'UPDATE usuarios SET ';

    query += req.body.tipo + '=' + parseInt(req.body.editado) + ' ';
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

router.post('/borrar/foto', (req, res) => {

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

router.post('/borrar/cuenta', (req, res) => {

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

router.get('/foto', (req, res) => {

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

module.exports = router