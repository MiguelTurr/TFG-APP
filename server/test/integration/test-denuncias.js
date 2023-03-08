const { By, until } = require('selenium-webdriver');
const assert = require('assert');
const { describe, it } = require('mocha');

//

const { crearDriver, obtenerTextoAlerta, crearCuentaDePrueba, borrarCuentaDePrueba, loginAccount } = require('../tools.js');

//

describe('Denunciar usuario', function () {

    var driver;
    this.timeout(10000);

    //

    before(async () => {
        await crearCuentaDePrueba();
        await crearCuentaDePrueba(1);

        driver = await crearDriver();
        await loginAccount(driver);
        setTimeout(async () => { await driver.get('http://localhost:3000/usuario/ver/11'); }, 2000);
    });

    it('Denuncia fallida, mensaje vacío', async function () {

        await driver.wait(until.elementLocated(By.xpath('/html/body/div/div/div[3]/div[4]/div/button')), 10000);
        const btn = await driver.findElement(By.xpath('/html/body/div/div/div[3]/div[4]/div/button'));

        await driver.executeScript("arguments[0].scrollIntoView(true);", btn);
        await btn.click();

        await driver.wait(until.elementLocated(By.xpath('//*[@id="denuncia-btn"]')), 10000);
        await driver.findElement(By.xpath('//*[@id="denuncia-btn"]')).click();

        const errorMessage = await driver.findElement(By.xpath('/html/body/div[3]/div/div/div[2]/div/div/div/form/div[2]/textarea')).getAttribute('validationMessage');
        assert.strictEqual(errorMessage, 'Rellene este campo.');
    });

    it('Denuncia fallida, mensaje demasiado corto', async function () {

        const element = await driver.wait(until.elementLocated(By.xpath('/html/body/div[3]/div/div/div[2]/div/div/div/form/div[2]/textarea')), 10000);
        element.clear();
        await driver.actions().sendKeys(element, 'Mensaje corto').perform();

        await driver.wait(until.elementLocated(By.xpath('//*[@id="denuncia-btn"]')), 10000);
        await driver.findElement(By.xpath('//*[@id="denuncia-btn"]')).click();

        const textoAlerta = await obtenerTextoAlerta(driver);
        assert.strictEqual(textoAlerta, '¡Mensaje demasiado corto!');
    });

    it('Denuncia exitosa', async function () {

        const element = await driver.wait(until.elementLocated(By.xpath('/html/body/div[3]/div/div/div[2]/div/div/div/form/div[2]/textarea')), 10000);
        element.clear();
        await driver.actions().sendKeys(element, 'Escribir una razón larga para que se valide la denuncia a otro usuario y poder probarla.').perform();

        await driver.wait(until.elementLocated(By.xpath('//*[@id="denuncia-btn"]')), 10000);
        await driver.findElement(By.xpath('//*[@id="denuncia-btn"]')).click();

        const textoAlerta = await obtenerTextoAlerta(driver);
        assert.strictEqual(textoAlerta, '¡Denuncia enviada!');
    });

    after(() => {
        driver.quit();
        borrarCuentaDePrueba();
        borrarCuentaDePrueba(1);
    });
});