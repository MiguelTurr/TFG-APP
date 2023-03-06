const { By, until } = require('selenium-webdriver');
const assert = require('assert');
const { describe, it } = require('mocha');

//

const { crearDriver, obtenerTextoAlerta, crearCuentaDePrueba, borrarCuentaDePrueba } = require('../tools.js');

const datos_email = {
    email: 'frank@app-tfg.com',
    invalid_email: 'email@incorrecto.com',
    invalid_format_email: 'emailincorrecto.com',
};

//

describe.skip('Recuperar contraseña', function () {

    var driver;
    this.timeout(10000);

    //

    before(async () => {
        await crearCuentaDePrueba();
    });

    beforeEach(async () => {
        driver = await crearDriver('nopassword');
    });

    it('Recuperar contraseña exitoso', async function () {

        const element = await driver.findElement(By.xpath('//*[@id="recordar-email"]'));
        await driver.actions().sendKeys(element, datos_email.email).perform();

        await driver.findElement(By.xpath('//*[@id="recordar-btn"]')).click();

        const textoAlerta = await obtenerTextoAlerta(driver);
        assert.strictEqual(textoAlerta, '¡Correo enviado!');
    });

    it('Recuperar contraseña fallido, email inválido', async function () {

        const element = await driver.findElement(By.xpath('//*[@id="recordar-email"]'));
        await driver.actions().sendKeys(element, datos_email.invalid_email).perform();

        await driver.findElement(By.xpath('//*[@id="recordar-btn"]')).click();

        const textoAlerta = await obtenerTextoAlerta(driver);
        assert.strictEqual(textoAlerta, '¡Los datos introducidos son incorrectos!');
    });

    it('Recuperar contraseña fallido, campo de email vacío', async function () {
        await driver.findElement(By.xpath('//*[@id="recordar-btn"]')).click();

        const errorMessage = await driver.findElement(By.xpath('//*[@id="recordar-email"]')).getAttribute('validationMessage');
        assert.strictEqual(errorMessage, 'Rellene este campo.');
    });

    it('Recuperar contraseña fallido, mal formato en el campo del email', async function () {

        const element = await driver.findElement(By.xpath('//*[@id="recordar-email"]'));
        await driver.actions().sendKeys(element, datos_email.invalid_format_email).perform();

        await driver.findElement(By.xpath('//*[@id="recordar-btn"]')).click();

        const errorMessage = await driver.findElement(By.xpath('//*[@id="recordar-email"]')).getAttribute('validationMessage');
        assert.strictEqual(errorMessage, 'Introduzca una dirección de correo.');
    });

    afterEach(async () => {
        driver.quit();
    });

    after(() => {
        borrarCuentaDePrueba();
    });
});
  
