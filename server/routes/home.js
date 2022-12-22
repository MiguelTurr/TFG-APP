const express = require('express');
const router = express.Router();

router.get('/prueba', (req, res) => {
    //console.log(req.userId);
    res.status(200).json({ respuesta: 'correcto' });
});

module.exports = router