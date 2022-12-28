const express = require('express');
const router = express.Router();

//

const mysql = require('../services/mysql.js');
const utils = require('../services/utils.js');

const PDFDocument = require('pdfkit');
const fs = require("fs");

//

router.get('/:id', (req, res) => {
    
    if (req.userId == undefined) {
        res.status(500).json({ respuesta: 'err_user' });
        return;
    }

    const mesBuscar = req.params.id;

    //

    var fecha = new Date();

    if(mesBuscar !== 'undefined') {
        var [crearMes, crearYear] = mesBuscar.split('-');
        fecha = new Date(crearYear, crearMes, 0);
    }

    const mes = fecha.getMonth() + 1;
    const year = fecha.getFullYear();
    const primerDia = new Date(year, mes - 1, 1);
    const ultimoDia = fecha;

    //

    var queryStr = 'SELECT res.ID,res.costeTotal,res.precioBase,res.fechaEntrada,res.fechaSalida,usu.ID as usuarioID,usu.nombre,usu.apellidos,usu.residencia FROM usuarios_reservas as res ';
    queryStr += 'INNER JOIN alojamientos as alo ON alo.ID=res.alojamientoID ';
    queryStr += 'INNER JOIN usuarios as usu ON usu.ID=alo.usuarioID ';

    queryStr += 'WHERE res.creadoEn BETWEEN "' +year+ '-' +mes+ '-1" AND "' +year+ '-' +mes+ '-' +ultimoDia.getDate()+ '" ';
    queryStr += 'AND usu.ID=' +req.userId+ ' AND estado>0';

    mysql.query(queryStr, function(err, result) {
        if (err) {
            res.status(500).json({ respuesta: 'err_db' });
            console.log(err.message);
            return;
        }

        const mesNombre = fecha.toLocaleString('default', { month: 'long' });
        
        const fechaAnterior = new Date(primerDia);
        fechaAnterior.setMonth(primerDia.getMonth() - 1);
        const mesAnteriorNombre = fechaAnterior.toLocaleString('default', { month: 'long' });

        const fechaSiguiente = new Date(primerDia);
        fechaSiguiente.setMonth(primerDia.getMonth() + 1);

        var mesSiguienteNombre = '';
        
        if(new Date().getTime() > fechaSiguiente.getTime()) {
            mesSiguienteNombre = fechaSiguiente.toLocaleString('default', { month: 'long' });
        }

        //

        const len = result.length;
        var totalGanancias = 0;
        var clienteNombre = '';
        var clienteResidencia = '';
        var clienteID = 0;

        var reservasArray = [];

        if(len > 0) {

            clienteID = result[0].usuarioID;
            clienteNombre = result[0].nombre+ ' ' +result[0].apellidos;
            clienteResidencia = result[0].residencia;

            for(var i = 0; i < len; i++) {
                totalGanancias += result[i].costeTotal;

                var objeto = {
                    ID: result[i].ID,
                    costeTotal: result[i].costeTotal,
                    precioBase: result[i].precioBase,
                    dias: utils.diasEntreFechas(new Date(result[i].fechaEntrada), new Date(result[i].fechaSalida)),
                };
                reservasArray.push(objeto);
            }

        }

        //

        res.status(200).json({ 
            respuesta: 'correcto', 

            mesInfo: {
                mes: mesNombre.toUpperCase(),
                year: year,
                primerDia: primerDia.toLocaleString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' }),
                ultimoDia: ultimoDia.toLocaleString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit' }),
        
                mesAnterior: mesAnteriorNombre.toUpperCase(),
                mesAnteriorNumero: fechaAnterior.getMonth() + 1,
                yearAnteriorNumero: fechaAnterior.getFullYear(),
        
                mesSiguiente: mesSiguienteNombre.toUpperCase(),
                mesSiguienteNumero: fechaSiguiente.getMonth() + 1,
                yearSiguienteNumero: fechaSiguiente.getFullYear(),

                clienteNombre: clienteNombre,
                clienteID: clienteID,
                clienteResidencia: clienteResidencia,

                reservas: len,
                totalGanancias: totalGanancias,
            },

            reservasInfo: reservasArray,
        });
    });
});

router.post('/descargar', (req, res) => {
    
    if (req.userId == undefined) {
        res.status(500).json({ respuesta: 'err_user' });
        return;
    }

    var nombreFile = req.userId+ '_' +req.body.mesNombre+ '_' +req.body.mesYear+ '.pdf';

    // GENERAR FACTURA
    
    const doc = new PDFDocument();
    const writeStream = fs.createWriteStream('./facturas/' +nombreFile);
    doc.pipe(writeStream);

    doc.image('./imagenes/logo.png', (doc.page.width - 200) / 2, 0);
    
    doc.fontSize(20).text(req.body.mesNombre+ ' DE ' +req.body.mesYear, 50, 150);
    doc.fillColor('grey').fontSize(10).text(req.body.primerDia+ ' - ' +req.body.ultimoDia);

    doc.fillColor('black');
    doc.fontSize(13);
    doc.text('FastForHolidays\n49028, Zamora\nEspaña', 50, 200);

    doc.text(`Web: www.fastforholidays.es\nE-mail: info@fastforholidays.com\nTel: +34 642444231`, 350, 200);
    
    doc.lineCap('butt')
        .moveTo(50, 260)
        .lineTo(550, 260)
        .fillAndStroke("blue", "blue")
        .stroke();
    
    doc.fillColor('black');
    doc.fontSize(20).text('FACTURA', 50, 280);

    doc.fontSize(13).text(req.body.clienteNombre+ '\n' +req.body.clienteResidencia+ '\n214141412X', 50, 320);

    // TABLA

    doc.lineJoin('miter').rect(50, 380, 500, 20).stroke('black');

    doc.text('ID', 90, 385);
    doc.text('Info', 250, 385);
    doc.text('Coste', 450, 385);

    const lenReservas = req.body.reservas.length;

    doc.lineJoin('miter').rect(50, 400, 500, 20 + 22 * lenReservas).stroke();

    for(var i = 0; i < lenReservas; i++) {
        doc.text(req.body.reservas[i].ID, 90, 407 + 22 * i);
        doc.text(req.body.reservas[i].dias+ ' días x ' +req.body.reservas[i].precioBase+ '€', 250, 407 + 22 * i);
        doc.text(req.body.reservas[i].costeTotal+ '€', 450, 407 + 22 * i);
    }

    doc.lineJoin('miter').rect(50, 400 + 22 * lenReservas, 500, 20).stroke();
    
    doc.text('Total', 90, 407 + 22 * lenReservas);
    doc.text(req.body.totalGanancias+ '€', 450, 407 + 22 * lenReservas);

    doc.end();

    //

    writeStream.on('finish', function () {
        var file = fs.readFileSync('./facturas/' +nombreFile, 'binary', function(err) {
            console.log(err);
            return;
        });
    
        res.set({ 'Content-Type': 'application/pdf', 'Content-Length': file.length });
        res.write(file, 'binary')
        res.end();
    });
});

module.exports = router