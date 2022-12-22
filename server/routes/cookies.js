const express = require('express');
const router = express.Router();

router.get('/aceptar', (req, res) => {

    res.status(200).cookie('cookiesAceptadas', true, {
        httpOnly: false,
        expires: new Date(Date.now() + 31536000000),
        secure: false,
        sameSite: true
    }).end();
});

module.exports = router