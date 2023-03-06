const { By, until, Key } = require('selenium-webdriver');
const assert = require('assert');
const { describe, it } = require('mocha');

//

const { crearDriver, obtenerTextoAlerta, crearCuentaDePrueba, crearAlojamientoDePrueba, borrarCuentaDePrueba, loginAccount, crearReserva } = require('../tools.js');

//

describe.skip('Ganancias', function () {

    var driver;
    this.timeout(10000);

    //

    before(async () => {
        await crearCuentaDePrueba();
        await crearAlojamientoDePrueba();
        await crearCuentaDePrueba(1);
        await crearReserva('Aceptado', 1);

        driver = await crearDriver();
        await loginAccount(driver);
        setTimeout(async () => { await driver.get('http://localhost:3000/perfil/mis-reservas/ganancias'); }, 2000);
    });

    it('No hay datos sobre un mes', async function () {
        await new Promise((resolve) => {
            setTimeout(async () => {
                await driver.wait(until.elementLocated(By.xpath('/html/body/div/div/div[3]/button[1]')), 10000);
                const btn = await driver.findElement(By.xpath('/html/body/div/div/div[3]/button[1]'));
        
                await driver.executeScript("arguments[0].scrollIntoView(true);", btn);
                await btn.click();

                resolve(true);
                    
            }, 3000);
        });

        const text = await driver.findElement(By.xpath('/html/body/div/div/div[3]/div[2]/div/h4')).getAttribute('innerHTML');
        assert.strictEqual(text, 'No hay datos sobre este mes.');
    });

    it('Descargar ganancias en .csv exitoso', async function () {
        await driver.findElement(By.xpath('/html/body/div/div/div[3]/button[2]')).click();

        await driver.wait(until.elementLocated(By.xpath('//*[@id="descargar-btn-csv"]')), 10000);
        await driver.findElement(By.xpath('//*[@id="descargar-btn-csv"]')).click();

        const textoAlerta = await obtenerTextoAlerta(driver);
        assert.strictEqual(textoAlerta, '¡Archivo descargado!');
    });

    it('Descargar ganancias en .pdf exitoso', async function () {

        await driver.wait(until.elementLocated(By.xpath('//*[@id="descargar-btn-pdf"]')), 10000);
        await driver.findElement(By.xpath('//*[@id="descargar-btn-pdf"]')).click();

        const textoAlerta = await obtenerTextoAlerta(driver);
        assert.strictEqual(textoAlerta, '¡Archivo descargado!');
    });

    after(() => {
        driver.quit();
        borrarCuentaDePrueba();
        borrarCuentaDePrueba(1);
    });
});
