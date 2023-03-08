const express = require('express');
const router = express.Router();

//

const mysql = require('../services/mysql.js');
const { queryFiltros, queryOrdenar, queryLimit } = require('../services/utils.js');

//

router.post('/', (req, res) => {

    var queryStr = '';

    if (req.userId == undefined) {
        queryStr += 'SELECT * FROM alojamientos as alo WHERE alo.usuarioID!=0 ';

    } else {
        queryStr += 'SELECT alo.*, fav.ID as favorito, vis.ID as visto FROM `alojamientos` as alo ';
        queryStr += 'LEFT JOIN `usuarios_favoritos` as fav ON fav.alojamientoID=alo.ID AND fav.usuarioID=' + req.userId + ' ';
        queryStr += 'LEFT JOIN `alojamientos_vistos` as vis ON vis.alojamientoID=alo.ID AND vis.usuarioID=' + req.userId + ' ';
        queryStr += 'WHERE alo.usuarioID!=' + req.userId + ' ';
    }

    // FILTROS

    queryStr += queryFiltros(req.body.filtros);

    // ORDENAR

    queryStr += queryOrdenar(req.body.ordenar);

    // LIMIT

    queryStr += queryLimit(req.body.contador);

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

module.exports = router