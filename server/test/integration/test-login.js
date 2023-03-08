const { By, until } = require('selenium-webdriver');
const assert = require('assert');
const { describe, it } = require('mocha');

//

const { crearDriver, obtenerTextoAlerta, crearCuentaDePrueba, actualizarEstadoCuenta, borrarCuentaDePrueba } = require('../tools.js');

const datos_login = {
    email: 'frank@app-tfg.com',
    password: 'frank',

    invalid_email: 'email@incorrecto.com',
    invalid_password: 'incorrecto',
};

//

describe('Loguear una cuenta', function () {

    var driver;
    this.timeout(10000);

    //

    before(async () => {
        await crearCuentaDePrueba();
    });

    beforeEach(async () => {
        driver = await crearDriver();
    });

    it('Login exitoso', async function () {

        await driver.findElement(By.className('dropdown')).findElement(By.className('user-btn-no')).click();
        await driver.wait(until.elementLocated(By.xpath("/html/body/div/div/div[2]/div[1]/div/div[3]/div/div")), 10000);
        await driver.findElement(By.xpath('/html/body/div/div/div[2]/div[1]/div/div[3]/div/div/span[1]/a[2]')).click();

        await rellenarCampo(driver, 'email');
        await rellenarCampo(driver, 'password');
    
        await driver.findElement(By.xpath('//*[@id="log-btn"]')).click();

        const textoAlerta = await obtenerTextoAlerta(driver);
        assert.strictEqual(textoAlerta, 'Has iniciado sesión como Francisco');
    });

    it('Login fallido, email incorrecto', async function () {

        await driver.findElement(By.className('dropdown')).findElement(By.className('user-btn-no')).click();
        await driver.wait(until.elementLocated(By.xpath("/html/body/div/div/div[2]/div[1]/div/div[3]/div/div")), 10000);
        await driver.findElement(By.xpath('/html/body/div/div/div[2]/div[1]/div/div[3]/div/div/span[1]/a[2]')).click();

        await rellenarCampo(driver, 'email', true);
        await rellenarCampo(driver, 'password');
    
        await driver.findElement(By.xpath('//*[@id="log-btn"]')).click();

        const textoAlerta = await obtenerTextoAlerta(driver);
        assert.strictEqual(textoAlerta, '¡Los datos introducidos son incorrectos!');
    });

    it('Login fallido, contraseña incorrecta', async function () {

        await driver.findElement(By.className('dropdown')).findElement(By.className('user-btn-no')).click();
        await driver.wait(until.elementLocated(By.xpath("/html/body/div/div/div[2]/div[1]/div/div[3]/div/div")), 10000);
        await driver.findElement(By.xpath('/html/body/div/div/div[2]/div[1]/div/div[3]/div/div/span[1]/a[2]')).click();

        await rellenarCampo(driver, 'email');
        await rellenarCampo(driver, 'password', true);
    
        await driver.findElement(By.xpath('//*[@id="log-btn"]')).click();

        const textoAlerta = await obtenerTextoAlerta(driver);
        assert.strictEqual(textoAlerta, '¡Los datos introducidos son incorrectos!');
    });

    it('Login fallido, campos vacios', async function () {

        await driver.findElement(By.className('dropdown')).findElement(By.className('user-btn-no')).click();
        await driver.wait(until.elementLocated(By.xpath("/html/body/div/div/div[2]/div[1]/div/div[3]/div/div")), 10000);
        await driver.findElement(By.xpath('/html/body/div/div/div[2]/div[1]/div/div[3]/div/div/span[1]/a[2]')).click();
    
        await driver.findElement(By.xpath('//*[@id="log-btn"]')).click();

        const errorMessage = await driver.findElement(By.xpath('/html/body/div[3]/div/div/div[2]/div/div/div/form/div[1]/input')).getAttribute('validationMessage');
        assert.strictEqual(errorMessage, 'Rellene este campo.');
    });

    it('Login fallido, cuenta sin verificar', async function () {

        await actualizarEstadoCuenta('Sin verificar');

        await driver.findElement(By.className('dropdown')).findElement(By.className('user-btn-no')).click();
        await driver.wait(until.elementLocated(By.xpath("/html/body/div/div/div[2]/div[1]/div/div[3]/div/div")), 10000);
        await driver.findElement(By.xpath('/html/body/div/div/div[2]/div[1]/div/div[3]/div/div/span[1]/a[2]')).click();

        await rellenarCampo(driver, 'email');
        await rellenarCampo(driver, 'password');
    
        await driver.findElement(By.xpath('//*[@id="log-btn"]')).click();

        const textoAlerta = await obtenerTextoAlerta(driver);
        assert.strictEqual(textoAlerta, '¡Mira tu correo para validar la cuenta!');
    });

    it('Login fallido, cuenta bloqueada', async function () {

        await actualizarEstadoCuenta('Bloqueada');

        await driver.findElement(By.className('dropdown')).findElement(By.className('user-btn-no')).click();
        await driver.wait(until.elementLocated(By.xpath("/html/body/div/div/div[2]/div[1]/div/div[3]/div/div")), 10000);
        await driver.findElement(By.xpath('/html/body/div/div/div[2]/div[1]/div/div[3]/div/div/span[1]/a[2]')).click();

        await rellenarCampo(driver, 'email');
        await rellenarCampo(driver, 'password');
    
        await driver.findElement(By.xpath('//*[@id="log-btn"]')).click();

        const textoAlerta = await obtenerTextoAlerta(driver);
        assert.strictEqual(textoAlerta, '¡Parece que esta cuenta está bloqueda!');
    });

    afterEach(async () => {
        driver.quit();
    });

    after(() => {
        borrarCuentaDePrueba();
    });
});

async function rellenarCampo(driver, campo, invalid=false) {

    var dato_campo = campo;

    if(invalid == true) {
        dato_campo = 'invalid_' +campo;
    }

    const campos = {
        email: '/html/body/div[3]/div/div/div[2]/div/div/div/form/div[1]/input',
        password: '/html/body/div[3]/div/div/div[2]/div/div/div/form/div[2]/input'
    };

    const element = await driver.findElement(By.xpath(campos[campo]));
    await driver.actions().sendKeys(element, datos_login[dato_campo]).perform();
}