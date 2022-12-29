const express = require('express');
const router = express.Router();

//

const mysql = require('../services/mysql.js');
const utils = require('../services/utils.js');

//

router.post('/', (req, res) => {

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
    mysql.query('INSERT INTO buscar_pais (nombre) VALUES (?) ON DUPLICATE KEY UPDATE busquedas=busquedas+1,ultimoEn=NOW();', req.body.pais);

    if(req.body.comunidad !== undefined) {
        queryStr += 'AND alo.comunidad="' +req.body.comunidad+ '" ';
    }

    if(req.body.provincia !== undefined) {
        queryStr += 'AND alo.provincia="' +req.body.provincia+ '" ';
    }

    if(req.body.localidad !== undefined) {
        queryStr += 'AND alo.localidad="' +req.body.localidad+ '" ';
        mysql.query('INSERT INTO buscar_ciudad (nombre) VALUES (?) ON DUPLICATE KEY UPDATE busquedas=busquedas+1,ultimoEn=NOW();', req.body.localidad);
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

module.exports = router