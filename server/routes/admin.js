const express = require('express');
const router = express.Router();

//

const mysql = require('../services/mysql.js');

//

router.get('/', async (req, res) => {

    if (req.userId == undefined) return res.status(500).json({ respuesta: 'err_user' });
    if (req.userRol == undefined || req.userRol == 'Usuario') return res.status(500).json({ respuesta: 'err_rol' });

    const totalAlojamientos = await new Promise((resolve) => {
        mysql.query('SELECT COUNT(*) as count FROM alojamientos', function (err, result) {
            if(err || result.length === 0) return resolve(0);
            resolve(result[0].count);
        });
    });

    const totalUsuarios = await new Promise((resolve) => {
        mysql.query('SELECT COUNT(*) as count FROM usuarios', function (err, result) {
            if(err || result.length === 0) return resolve(0);
            resolve(result[0].count);
        });
    });

    const totalDenuncias = await new Promise((resolve) => {
        mysql.query('SELECT COUNT(*) as count FROM usuarios_denuncias', function (err, result) {
            if(err || result.length === 0) return resolve(0);
            resolve(result[0].count);
        });
    });

    const totalAlojamientosValorados = await new Promise((resolve) => {
        mysql.query('SELECT COUNT(*) as count FROM alojamientos_valoraciones', function (err, result) {
            if(err || result.length === 0) return resolve(0);
            resolve(result[0].count);
        });
    });

    const totalAdmins = await new Promise((resolve) => {
        mysql.query('SELECT COUNT(*) as count FROM usuarios WHERE rol>0', function (err, result) {
            if(err || result.length === 0) return resolve(0);
            resolve(result[0].count);
        });
    });

    const totalReservas = await new Promise((resolve) => {
        mysql.query('SELECT COUNT(*) as count FROM usuarios_reservas WHERE estado=1', function (err, result) {
            if(err || result.length === 0) return resolve(0);
            resolve(result[0].count);
        });
    });

    const ciudadesBuscadas = await new Promise((resolve) => {
        mysql.query('SELECT nombre,busquedas FROM buscar_ciudad ORDER BY busquedas DESC LIMIT 5', function (err, result) {
            if(err || result.length === 0) return resolve([]);
            resolve(result);
        });
    });

    const paisesBuscados = await new Promise((resolve) => {
        mysql.query('SELECT nombre,busquedas FROM buscar_pais ORDER BY busquedas DESC LIMIT 5', function (err, result) {
            if(err || result.length === 0) return resolve([]);
            resolve(result);
        });
    });

    res.status(200).json({ respuesta: 'correcta', admin: {
        alojamientos: totalAlojamientos,
        usuarios: totalUsuarios,
        alojamientosValorados: totalAlojamientosValorados,
        reportes: totalDenuncias,
        administradores: totalAdmins,
        reservas: totalReservas,

        ciudades: ciudadesBuscadas,
        paises: paisesBuscados
    }});
});

module.exports = router