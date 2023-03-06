const { By, until } = require('selenium-webdriver');
const assert = require('assert');
const { describe, it } = require('mocha');

//

const { crearDriver, crearCuentaDePrueba, actualizarEstadoCuenta, borrarCuentaDePrueba } = require('../tools.js');

//

describe.skip('Validar una cuenta', function () {

    var driver;
    this.timeout(10000);

    //

    before(async () => {
        await crearCuentaDePrueba();
        await actualizarEstadoCuenta('Sin verificar');
    });

    beforeEach(async () => {
        driver = await crearDriver('validar/prueba');
    });

    it('Cuenta sin verificar', async function () {
        const elementText = await driver.findElement(By.xpath('/html/body/div/div/div[3]/div/div/h5')).getAttribute('innerHTML');
        assert.strictEqual(elementText, 'Su correo ha sido validado correctamente. Ya puede iniciar sesión en su cuenta.');
    });

    it('Cuenta ya verificada', async function () {
        const elementText = await driver.findElement(By.xpath('/html/body/div/div/div[3]/div/div/h5')).getAttribute('innerHTML');
        assert.strictEqual(elementText, 'Ese código ya ha sido validado o no existe.');
    });

    afterEach(async () => {
        driver.quit();
    });

    after(() => {
        borrarCuentaDePrueba();
    });
});