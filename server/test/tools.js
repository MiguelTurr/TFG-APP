const { Builder, Browser, By, until } = require('selenium-webdriver');
const mysql = require('../services/mysql.js');
const path = require('path');

//

const email = ['frank@app-tfg.com', 'pruebas@app-tfg.com'];
const ID = [10, 11];

const test_cuenta = {
    ID: 10,
    verificacion: 'prueba',
    password: 'frank',
    password_encriptada: '$2a$10$kxD.q52aHGC3BKIEMLVRVeqc1bPAtTbcJDu1lvDaF60gb0wOw41qy',
    nombre: 'Francisco',
    apellidos: 'Garcia Sanchez',
    nacimiento: '1990-05-10',
    telefono: '+34 4707529'
};

const test_alojamiento = {
    ID: 2000,
    titulo: 'Titulo de pruebaa',
    descripcion: 'Descripcion de prueba para un alojamiento',
    precio: 200,
    ubicacion: 'Prueba, Prueba, Prueba, Prueba',
    localidad: 'Prueba',
    provincia: 'Prueba',
    comunidad: 'Prueba',
    pais: 'Prueba',
    servicios: 0,
};

const url = 'http://localhost:3000/';

//

async function crearDriver(path='') {
    let driver = await new Builder().forBrowser(Browser.FIREFOX).build();
    await driver.get(url+ '' +path);

    return driver;
}

async function obtenerTextoAlerta(driver) {
    await driver.wait(until.elementLocated(By.xpath("/html/body/div[1]/div/div[1]/div")), 10000);

    const textoAlerta = await driver.findElement(By.xpath('/html/body/div[1]/div/div[1]/div')).getAttribute('innerHTML');
    return textoAlerta.split('<br>')[1];
}

async function crearCuentaDePrueba(cuenta=0) {

    await new Promise((resolve) => { 

        mysql.query(`INSERT INTO usuarios \
            (ID, estado, verificacion, email, password, nombre, apellidos, fechaNac, telefono) \
            VALUES \
            (${ID[cuenta]}, 'Activa', '${test_cuenta.verificacion}',  '${email[cuenta]}', '${test_cuenta.password_encriptada}', '${test_cuenta.nombre}', \
            '${test_cuenta.apellidos}', '${test_cuenta.nacimiento}', '${test_cuenta.telefono}')`, (err) => {

            if(err) console.log(err.message);
            resolve(true)
        });
    });
}

function borrarCuentaDePrueba(cuenta=0) {
    mysql.query('DELETE FROM usuarios WHERE ID=' +ID[cuenta]);
}

async function actualizarEstadoCuenta(estado, cuenta=0) {
    await new Promise((resolve) => { 
        mysql.query(`UPDATE usuarios SET estado='${estado}' WHERE ID=${ID[cuenta]}`, (err) => {

            if(err) console.log(err);
            resolve(true);
        })
    });
}

async function crearAlojamientoDePrueba(cuenta=0) {

    await new Promise((resolve) => { 
        
        mysql.query(`INSERT INTO alojamientos \
            (ID, usuarioID, titulo, descripcion, precio, ubicacion, localidad, provincia, comunidad, pais, servicios) \
            VALUES \
            (${test_alojamiento.ID}, ${ID[cuenta]}, '${test_alojamiento.titulo}', '${test_alojamiento.descripcion}', ${test_alojamiento.precio}, '${test_alojamiento.ubicacion}', \
            '${test_alojamiento.localidad}', '${test_alojamiento.provincia}', '${test_alojamiento.comunidad}', '${test_alojamiento.pais}', \
            ${test_alojamiento.servicios})`, (err) => {

            if(err) console.log(err.message);
            resolve(true)
        });
    });
}

async function crearReserva(estado, cuenta=0) {
    await new Promise((resolve) => { 
        
        mysql.query(`INSERT INTO usuarios_reservas \
            (usuarioID, alojamientoID, estado, creadoEn, fechaEntrada, fechaSalida, pagoID, precioBase, costeTotal, numeroViajeros, numeroMascotas) \
            VALUES \
            (${ID[cuenta]}, ${test_alojamiento.ID}, '${estado}', DATE_ADD(NOW(), INTERVAL -1 DAY), '2023-03-01 15:10:10', '2023-03-06 15:10:10', 'PagoPrueba', 500, 3000, 2, 0)`, (err) => {

            if(err) console.log(err.message);
            resolve(true)
        });
    });
}

async function loginAccount(driver, cuenta=0) {
    
    await driver.findElement(By.className('dropdown')).findElement(By.className('user-btn-no')).click();
    await driver.wait(until.elementLocated(By.xpath("/html/body/div/div/div[2]/div[1]/div/div[3]/div/div")), 10000);
    await driver.findElement(By.xpath('/html/body/div/div/div[2]/div[1]/div/div[3]/div/div/span[1]/a[2]')).click();

    const emailInput = await driver.findElement(By.xpath('/html/body/div[3]/div/div/div[2]/div/div/div/form/div[1]/input'));
    await driver.actions().sendKeys(emailInput, email[cuenta]).perform();

    const password = await driver.findElement(By.xpath('/html/body/div[3]/div/div/div[2]/div/div/div/form/div[2]/input'));
    await driver.actions().sendKeys(password, test_cuenta.password).perform();

    await driver.findElement(By.xpath('//*[@id="log-btn"]')).click();
}

async function subirImagen(driver, imagen_name, input) {
    
    const absolutePath = path.resolve(__dirname, './files/' +imagen_name);
        
    await driver.wait(until.elementLocated(By.xpath(input)), 10000);
    const inputImagen = await driver.findElement(By.xpath(input));
    await inputImagen.sendKeys(absolutePath);
}

module.exports = {
    crearDriver,
    obtenerTextoAlerta,
    crearCuentaDePrueba,

    actualizarEstadoCuenta,
    borrarCuentaDePrueba,

    loginAccount,
    
    crearAlojamientoDePrueba,

    subirImagen,

    crearReserva
}