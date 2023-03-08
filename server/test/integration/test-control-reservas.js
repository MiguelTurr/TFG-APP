const { By, until, Key } = require('selenium-webdriver');
const assert = require('assert');
const { describe, it } = require('mocha');

//

const { crearDriver, obtenerTextoAlerta, crearCuentaDePrueba, borrarCuentaDePrueba, loginAccount, crearAlojamientoDePrueba, crearReserva } = require('../tools.js');

//

describe('Control de reservas', function () {

    var driver;
    this.timeout(10000);

    //

    before(async () => {
        await crearCuentaDePrueba();
        await crearCuentaDePrueba(1);
        await crearAlojamientoDePrueba();
        await crearReserva('Revisión', 0);
        await crearReserva('Revisión', 0);

        driver = await crearDriver();
        await loginAccount(driver);
        setTimeout(async () => { await driver.get('http://localhost:3000/perfil/mis-reservas'); }, 2000);
    });

    it('Cancelar reserva usuario', async function() {

        await driver.wait(until.elementLocated(By.xpath('/html/body/div/div/div[3]/div[1]/div/button[2]')), 10000);
        await driver.findElement(By.xpath(('/html/body/div/div/div[3]/div[1]/div/button[2]'))).click();

        await driver.wait(until.elementLocated(By.xpath('/html/body/div/div/div[3]/div[2]/div/table/tbody/tr[1]/td[4]/div/button[2]')), 10000);
        await driver.findElement(By.xpath(('/html/body/div/div/div[3]/div[2]/div/table/tbody/tr[1]/td[4]/div/button[2]'))).click();

        await driver.switchTo().alert().accept();

        const textoAlerta = await obtenerTextoAlerta(driver);
        assert.strictEqual(textoAlerta, '¡Reserva cancelada!');
    });

    it('Aceptar reserva usuario', async function() {
        await driver.wait(until.elementLocated(By.xpath('/html/body/div/div/div[3]/div[2]/div/table/tbody/tr[2]/td[4]/div/button[1]')), 10000);
        await driver.findElement(By.xpath(('/html/body/div/div/div[3]/div[2]/div/table/tbody/tr[2]/td[4]/div/button[1]'))).click();

        await driver.switchTo().alert().accept();

        const textoAlerta = await obtenerTextoAlerta(driver);
        assert.strictEqual(textoAlerta, '¡Reserva confirmada!');
    });

    it('Valorar inquilino fallido, mensaje demasiado corto', async function() {

        await new Promise((resolve) => {
            setTimeout(async () => { 
                await driver.get('http://localhost:3000/perfil/mis-reservas/alojamientos');
                resolve(true);
            }, 1000);
        });

        await driver.wait(until.elementLocated(By.xpath('/html/body/div/div/div[3]/div[2]/div/table/tbody/tr/td[4]/div/button[3]')), 10000);
        await driver.findElement(By.xpath(('/html/body/div/div/div[3]/div[2]/div/table/tbody/tr/td[4]/div/button[3]'))).click();

        await driver.wait(until.elementLocated(By.xpath('//*[@id="huesped-valoracion"]')), 10000);
        await driver.findElement(By.xpath(('//*[@id="huesped-valoracion"]'))).click();

        const textoAlerta = await obtenerTextoAlerta(driver);
        assert.strictEqual(textoAlerta, '¡El mensaje es demasiado corto!');
    });

    it('Valorar inquilino fallido, no se ha seleccionado el tipo de valoración', async function() {

        const element = await driver.wait(until.elementLocated(By.xpath('//*[@id="huesped-mensaje"]')), 10000);
        element.clear();
        await driver.actions().sendKeys(element, 'Mensaje de valroación de prueba a ver como sale si es demasiado largo.').perform();

        await driver.wait(until.elementLocated(By.xpath('//*[@id="huesped-valoracion"]')), 10000);
        await driver.findElement(By.xpath(('//*[@id="huesped-valoracion"]'))).click();

        const textoAlerta = await obtenerTextoAlerta(driver);
        assert.strictEqual(textoAlerta, '¡Selecciona un tipo de valoración!');
    });

    it('Valorar inquilino exitoso', async function() {

        await new Promise((resolve) => {
            setTimeout(() => { 
                resolve(true);
            }, 2000);
        });

        await driver.findElement(By.xpath(('//*[@id="val-positiva"]'))).click();

        await driver.wait(until.elementLocated(By.xpath('//*[@id="huesped-valoracion"]')), 10000);
        await driver.findElement(By.xpath(('//*[@id="huesped-valoracion"]'))).click();

        const textoAlerta = await obtenerTextoAlerta(driver);
        assert.strictEqual(textoAlerta, '¡Valoración enviada!');
    });

    it('Valorar alojamiento fallido, mensaje demasiado corto', async function() {

        await new Promise((resolve) => {
            setTimeout(async () => { 
                await driver.get('http://localhost:3000/perfil/mis-reservas');
                resolve(true);
            }, 1000);
        });

        await driver.wait(until.elementLocated(By.xpath('/html/body/div/div/div[3]/div[2]/div/table/tbody/tr/td[4]/div/button[2]')), 10000);
        await driver.findElement(By.xpath(('/html/body/div/div/div[3]/div[2]/div/table/tbody/tr/td[4]/div/button[2]'))).click();

        await driver.wait(until.elementLocated(By.xpath('//*[@id="valoracion-btn"]')), 10000);
        await driver.findElement(By.xpath(('//*[@id="valoracion-btn"]'))).click();

        const textoAlerta = await obtenerTextoAlerta(driver);
        assert.strictEqual(textoAlerta, '¡El mensaje es demasiado corto!');
    });

    it('Valorar alojamiento exitoso', async function() {

        const element = await driver.wait(until.elementLocated(By.xpath('/html/body/div[3]/div/div/div[2]/div/div/div[3]/form/div[7]/textarea')), 10000);
        element.clear();
        await driver.actions().sendKeys(element, 'Mensaje de valroación de prueba a ver como sale si es demasiado largo.').perform();

        await driver.wait(until.elementLocated(By.xpath('//*[@id="valoracion-btn"]')), 10000);
        await driver.findElement(By.xpath(('//*[@id="valoracion-btn"]'))).click();

        const textoAlerta = await obtenerTextoAlerta(driver);
        assert.strictEqual(textoAlerta, '¡Valoración enviada!');
    });


    after(() => {
        driver.quit();
        borrarCuentaDePrueba();
        borrarCuentaDePrueba(1);
    });
});