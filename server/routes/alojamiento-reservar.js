const express = require('express');
const router = express.Router();

//

const mysql = require('../services/mysql.js');

const { paypal, paypalClient } = require("../services/paypal.js");
const { enviarCorreo } = require('../services/utils.js');

//

router.get('/:id', (req, res) => {

    if (req.userId == undefined) {
        res.status(500).json({ respuesta: 'err_user' });
        return;
    }

    const alojamientoId = req.params.id;

    mysql.query('SELECT ID,usuarioID,ubicacion,precio,valoracionMedia,vecesValorado FROM alojamientos WHERE ID=? LIMIT 1', alojamientoId, function (err, result) {
        if (err) {
            res.status(500).json({ respuesta: 'err_db' });
            console.log(err.message);
            return;
        }

        if(req.userId === result[0].usuarioID) {
            return res.status(500).json({ respuesta: 'err_reserva' });
        }

        res.status(200).json({ respuesta: 'correcto', alojamiento: result[0] });
    });
});

router.post('/', async (req, res) => {

    if (req.userId == undefined) {
        res.status(500).json({ respuesta: 'err_user' });
        return;
    }

    try {

        let request = new paypal.orders.OrdersCreateRequest();
        const precioTotal = parseFloat(req.body.noches * req.body.precioBase).toFixed(2) * 1.00;

        //
        
        request.prefer("return=representation");
        request.requestBody({
            intent: "CAPTURE",

            purchase_units: [{
                description: "Pago para la compañía FastForHolidays",
                soft_descriptor: "Alquiler de casas",

                amount: {
                    currency_code: "EUR",
                    value: precioTotal, 
                    breakdown: {
                        item_total: {
                            currency_code: "EUR",
                            value: precioTotal,
                        },
                    },
                },
                items: [
                    {
                        name: 'noches',
                        unit_amount: {
                            currency_code: 'EUR',
                            value: Number.parseFloat(req.body.precioBase).toFixed(2) * 1.00,
                        },
                        quantity: Number.parseFloat(req.body.noches).toFixed(2) * 1.00,
                    }
                ]
            }, ],
        });

        //

        const order = await paypalClient.execute(request);
        res.status(200).json({ respuesta: 'correcto', orderID: order.result.id });

    } catch(e) {
        res.status(500).json({ respuesta: 'err_paypal' });
        console.log(e)
    }
});

router.post('/aceptada', async (req, res) => {

    if (req.userId == undefined) {
        res.status(500).json({ respuesta: 'err_user' });
        return;
    }

    const orderID = req.body.orderID;
    const request = new paypal.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});

    try {

        const capture = await paypalClient.execute(request);

        if(capture.result.status !== 'COMPLETED') {
            res.status(500).json({ respuesta: 'err_paypal' });
            return;
        }

        mysql.query('INSERT INTO usuarios_reservas (usuarioID, alojamientoID, fechaEntrada, fechaSalida, costeTotal, numeroViajeros, numeroMascotas, pagoID, precioBase) VALUES (?)',
        [
            [
                req.userId,
                req.body.alojamientoID,
                req.body.fechaEntrada,
                req.body.fechaSalida,
                req.body.costeTotal,
                req.body.personas,
                req.body.mascotas,
                capture.result.id,
                req.body.precioBase
            ]

        ], function (err) {

             if (err) {
                res.status(500).json({ respuesta: 'err_db' });
                console.log(err.message);
                return;
            }

            res.status(200).json({ respuesta: 'correcto' });

            // ENVIAR CORREO AL DUEÑO

            mysql.query(`SELECT alo.ubicacion, alo.titulo, usu.email FROM alojamientos as alo
                INNER JOIN usuarios as usu ON usu.ID=alo.usuarioID
                WHERE alo.ID=?`, 
                [
                    req.body.alojamientoID
                ], 
                function(err, result) {

                    if(err || result.length === 0) {
                        return;
                    }

                    try {

                        var textoEmail = 'Hola, parece que uno de tus alojamientos ha sido reservado por ' +req.body.noches+ ' noches.\n\n';
                        textoEmail += 'Título: ' +result[0].titulo+ '\n';
                        textoEmail += 'Ubicación: ' +result[0].ubicacion+ '\n';
                        textoEmail += 'Reserva: ' +req.body.noches+ ' noches x ' +req.body.precioBase+'€\n';
                        textoEmail += 'Coste total: ' +req.body.costeTotal+ '€\n';
                        textoEmail += '\n\nUn saludo desde 2FH.'

                        enviarCorreo('¡Uno de tus alojamientos ha sido reservado!', textoEmail, result[0].email);
        
                    } catch (err) {
                        console.log(err);
                    }
                }
            );
        });

    } catch (err) {
        res.status(500).json({ respuesta: 'err_paypal' });
    }
});

module.exports = router