const { By, until } = require('selenium-webdriver');
const assert = require('assert');
const { describe, it } = require('mocha');
const mysql = require('../../services/mysql.js');

//

const { crearDriver, obtenerTextoAlerta } = require('../tools.js');

const datos_registro = {
    nombre: 'Prueba',
    apellidos: 'Prueba Prueba',
    email: 'prueba@gmail.com',
    fecha: '10/10/1990',
    password: 'pruebaprueba',
    confirm_password: 'pruebaprueba',
    telefono: '424562',

    invalid_nombre: 'Prueba22',
    invalid_apellidos: 'Prueba Prueba 22',
    invalid_email: 'emailincorrecto.com',
    invalid_fecha: '10/10/2020',
    invalid_password: 'a',
    invalid_confirm_password: 'pruebaaaaa',
};

//

describe('Registrar una cuenta', function () {

    var driver;
    this.timeout(10000);

    //

    beforeEach(async () => {
        driver = await crearDriver();
    });

    it('Registro exitoso', async function () {

        await driver.findElement(By.className('dropdown')).findElement(By.className('user-btn-no')).click();
        await driver.wait(until.elementLocated(By.xpath("/html/body/div/div/div[2]/div[1]/div/div[3]/div/div")), 10000);
        await driver.findElement(By.xpath('/html/body/div/div/div[2]/div[1]/div/div[3]/div/div/span[1]/a[1]')).click();

        await rellenarCampo(driver, 'nombre');
        await rellenarCampo(driver, 'apellidos');
        await rellenarCampo(driver, 'email');
        await rellenarCampo(driver, 'fecha');
        await rellenarCampo(driver, 'password');
        await rellenarCampo(driver, 'confirm_password');
        await rellenarCampo(driver, 'telefono');

        await driver.findElement(By.xpath('/html/body/div[3]/div/div/div[2]/div/form/div/div[1]/div[2]/div[4]/div[1]/input')).click();
        await driver.findElement(By.xpath('/html/body/div[3]/div/div/div[2]/div/form/div/div[1]/div[2]/div[4]/div[2]/input')).click();

        await driver.findElement(By.xpath('//*[@id="reg-btn"]')).click();

        const textoAlerta = await obtenerTextoAlerta(driver);
        assert.strictEqual(textoAlerta, '¡Verifica tu cuenta en el correo electrónico!');
    });

    it('Registro fallido, el correo ya existe', async function() {
        await driver.wait(until.elementLocated(By.className('user-btn-no')), 10000);
        await driver.findElement(By.className('dropdown')).findElement(By.className('user-btn-no')).click();
        await driver.wait(until.elementLocated(By.xpath("/html/body/div/div/div[2]/div[1]/div/div[3]/div/div")), 10000);
        await driver.findElement(By.xpath('/html/body/div/div/div[2]/div[1]/div/div[3]/div/div/span[1]/a[1]')).click();

        await rellenarCampo(driver, 'nombre');
        await rellenarCampo(driver, 'apellidos');
        await rellenarCampo(driver, 'email');
        await rellenarCampo(driver, 'fecha');
        await rellenarCampo(driver, 'password');
        await rellenarCampo(driver, 'confirm_password');
        await rellenarCampo(driver, 'telefono');

        await driver.findElement(By.xpath('/html/body/div[3]/div/div/div[2]/div/form/div/div[1]/div[2]/div[4]/div[1]/input')).click();
        await driver.findElement(By.xpath('/html/body/div[3]/div/div/div[2]/div/form/div/div[1]/div[2]/div[4]/div[2]/input')).click();

        await driver.findElement(By.xpath('//*[@id="reg-btn"]')).click();

        const textoAlerta = await obtenerTextoAlerta(driver);
        assert.strictEqual(textoAlerta, '¡Ese correo ya está en uso!');
    });

    it('Registro fallido, el nombre contiene numeros', async function() {
        await driver.wait(until.elementLocated(By.className('user-btn-no')), 10000);
        await driver.findElement(By.className('dropdown')).findElement(By.className('user-btn-no')).click();
        await driver.wait(until.elementLocated(By.xpath("/html/body/div/div/div[2]/div[1]/div/div[3]/div/div")), 10000);
        await driver.findElement(By.xpath('/html/body/div/div/div[2]/div[1]/div/div[3]/div/div/span[1]/a[1]')).click();

        await rellenarCampo(driver, 'nombre', true);
        await rellenarCampo(driver, 'apellidos');
        await rellenarCampo(driver, 'email');
        await rellenarCampo(driver, 'fecha');
        await rellenarCampo(driver, 'password');
        await rellenarCampo(driver, 'confirm_password');
        await rellenarCampo(driver, 'telefono');

        await driver.findElement(By.xpath('/html/body/div[3]/div/div/div[2]/div/form/div/div[1]/div[2]/div[4]/div[1]/input')).click();
        await driver.findElement(By.xpath('/html/body/div[3]/div/div/div[2]/div/form/div/div[1]/div[2]/div[4]/div[2]/input')).click();

        await driver.findElement(By.xpath('//*[@id="reg-btn"]')).click();

        const textoAlerta = await obtenerTextoAlerta(driver);
        assert.strictEqual(textoAlerta, '¡El nombre no puede contener números!');
    });

    it('Registro fallido, los apellidos contiene numeros', async function() {
        await driver.wait(until.elementLocated(By.className('user-btn-no')), 10000);
        await driver.findElement(By.className('dropdown')).findElement(By.className('user-btn-no')).click();
        await driver.wait(until.elementLocated(By.xpath("/html/body/div/div/div[2]/div[1]/div/div[3]/div/div")), 10000);
        await driver.findElement(By.xpath('/html/body/div/div/div[2]/div[1]/div/div[3]/div/div/span[1]/a[1]')).click();

        await rellenarCampo(driver, 'nombre');
        await rellenarCampo(driver, 'apellidos', true);
        await rellenarCampo(driver, 'email');
        await rellenarCampo(driver, 'fecha');
        await rellenarCampo(driver, 'password');
        await rellenarCampo(driver, 'confirm_password');
        await rellenarCampo(driver, 'telefono');

        await driver.findElement(By.xpath('/html/body/div[3]/div/div/div[2]/div/form/div/div[1]/div[2]/div[4]/div[1]/input')).click();
        await driver.findElement(By.xpath('/html/body/div[3]/div/div/div[2]/div/form/div/div[1]/div[2]/div[4]/div[2]/input')).click();

        await driver.findElement(By.xpath('//*[@id="reg-btn"]')).click();

        const textoAlerta = await obtenerTextoAlerta(driver);
        assert.strictEqual(textoAlerta, '¡Los apellidos no pueden contener números!');
    });

    it('Registro fallido, la fecha de nacimiento es menor a 18 años', async function() {
        await driver.wait(until.elementLocated(By.className('user-btn-no')), 10000);
        await driver.findElement(By.className('dropdown')).findElement(By.className('user-btn-no')).click();
        await driver.wait(until.elementLocated(By.xpath("/html/body/div/div/div[2]/div[1]/div/div[3]/div/div")), 10000);
        await driver.findElement(By.xpath('/html/body/div/div/div[2]/div[1]/div/div[3]/div/div/span[1]/a[1]')).click();

        await rellenarCampo(driver, 'nombre');
        await rellenarCampo(driver, 'apellidos');
        await rellenarCampo(driver, 'email');
        await rellenarCampo(driver, 'fecha', true);
        await rellenarCampo(driver, 'password');
        await rellenarCampo(driver, 'confirm_password');
        await rellenarCampo(driver, 'telefono');

        await driver.findElement(By.xpath('/html/body/div[3]/div/div/div[2]/div/form/div/div[1]/div[2]/div[4]/div[1]/input')).click();
        await driver.findElement(By.xpath('/html/body/div[3]/div/div/div[2]/div/form/div/div[1]/div[2]/div[4]/div[2]/input')).click();

        await driver.findElement(By.xpath('//*[@id="reg-btn"]')).click();

        const textoAlerta = await obtenerTextoAlerta(driver);
        assert.strictEqual(textoAlerta, '¡Debes tener más de 18 años!');
    });

    it('Registro fallido, mal formato en el campo del email', async function() {
        await driver.wait(until.elementLocated(By.className('user-btn-no')), 10000);
        await driver.findElement(By.className('dropdown')).findElement(By.className('user-btn-no')).click();
        await driver.wait(until.elementLocated(By.xpath("/html/body/div/div/div[2]/div[1]/div/div[3]/div/div")), 10000);
        await driver.findElement(By.xpath('/html/body/div/div/div[2]/div[1]/div/div[3]/div/div/span[1]/a[1]')).click();

        await rellenarCampo(driver, 'nombre');
        await rellenarCampo(driver, 'apellidos');
        await rellenarCampo(driver, 'email', true);
        await rellenarCampo(driver, 'fecha');
        await rellenarCampo(driver, 'password');
        await rellenarCampo(driver, 'confirm_password');
        await rellenarCampo(driver, 'telefono');

        await driver.findElement(By.xpath('/html/body/div[3]/div/div/div[2]/div/form/div/div[1]/div[2]/div[4]/div[1]/input')).click();
        await driver.findElement(By.xpath('/html/body/div[3]/div/div/div[2]/div/form/div/div[1]/div[2]/div[4]/div[2]/input')).click();

        await driver.findElement(By.xpath('//*[@id="reg-btn"]')).click();

        const errorMessage = await driver.findElement(By.xpath('/html/body/div[3]/div/div/div[2]/div/form/div/div[1]/div[1]/div[4]/input')).getAttribute('validationMessage');
        assert.strictEqual(errorMessage, 'Introduzca una dirección de correo.');
    });

    it('Registro fallido, el campo del nombre está vacío', async function() {
        await driver.wait(until.elementLocated(By.className('user-btn-no')), 10000);
        await driver.findElement(By.className('dropdown')).findElement(By.className('user-btn-no')).click();
        await driver.wait(until.elementLocated(By.xpath("/html/body/div/div/div[2]/div[1]/div/div[3]/div/div")), 10000);
        await driver.findElement(By.xpath('/html/body/div/div/div[2]/div[1]/div/div[3]/div/div/span[1]/a[1]')).click();

        await driver.findElement(By.xpath('//*[@id="reg-btn"]')).click();

        const errorMessage = await driver.findElement(By.xpath('/html/body/div[3]/div/div/div[2]/div/form/div/div[1]/div[1]/div[1]/input')).getAttribute('validationMessage');
        assert.strictEqual(errorMessage, 'Rellene este campo.');
    });

    it('Registro fallido, no se han aceptado los términos y condiciones', async function() {
        await driver.wait(until.elementLocated(By.className('user-btn-no')), 10000);
        await driver.findElement(By.className('dropdown')).findElement(By.className('user-btn-no')).click();
        await driver.wait(until.elementLocated(By.xpath("/html/body/div/div/div[2]/div[1]/div/div[3]/div/div")), 10000);
        await driver.findElement(By.xpath('/html/body/div/div/div[2]/div[1]/div/div[3]/div/div/span[1]/a[1]')).click();

        await rellenarCampo(driver, 'nombre');
        await rellenarCampo(driver, 'apellidos');
        await rellenarCampo(driver, 'email');
        await rellenarCampo(driver, 'fecha');
        await rellenarCampo(driver, 'password');
        await rellenarCampo(driver, 'confirm_password');
        await rellenarCampo(driver, 'telefono');

        await driver.findElement(By.xpath('//*[@id="reg-btn"]')).click();

        const textoAlerta = await obtenerTextoAlerta(driver);
        assert.strictEqual(textoAlerta, '¡Acepta los términos y condiciones!');
    });

    it('Registro fallido, no se ha aceptado el aviso de privacidad', async function() {
        await driver.wait(until.elementLocated(By.className('user-btn-no')), 10000);
        await driver.findElement(By.className('dropdown')).findElement(By.className('user-btn-no')).click();
        await driver.wait(until.elementLocated(By.xpath("/html/body/div/div/div[2]/div[1]/div/div[3]/div/div")), 10000);
        await driver.findElement(By.xpath('/html/body/div/div/div[2]/div[1]/div/div[3]/div/div/span[1]/a[1]')).click();

        await rellenarCampo(driver, 'nombre');
        await rellenarCampo(driver, 'apellidos');
        await rellenarCampo(driver, 'email');
        await rellenarCampo(driver, 'fecha');
        await rellenarCampo(driver, 'password');
        await rellenarCampo(driver, 'confirm_password');
        await rellenarCampo(driver, 'telefono');

        await driver.findElement(By.xpath('/html/body/div[3]/div/div/div[2]/div/form/div/div[1]/div[2]/div[4]/div[1]/input')).click();

        await driver.findElement(By.xpath('//*[@id="reg-btn"]')).click();

        const textoAlerta = await obtenerTextoAlerta(driver);
        assert.strictEqual(textoAlerta, '¡Acepta el aviso de privacidad!');
    });

    it('Registro fallido, contraseña demasiado corta', async function() {
        await driver.wait(until.elementLocated(By.className('user-btn-no')), 10000);
        await driver.findElement(By.className('dropdown')).findElement(By.className('user-btn-no')).click();
        await driver.wait(until.elementLocated(By.xpath("/html/body/div/div/div[2]/div[1]/div/div[3]/div/div")), 10000);
        await driver.findElement(By.xpath('/html/body/div/div/div[2]/div[1]/div/div[3]/div/div/span[1]/a[1]')).click();

        await rellenarCampo(driver, 'nombre');
        await rellenarCampo(driver, 'apellidos');
        await rellenarCampo(driver, 'email');
        await rellenarCampo(driver, 'fecha');
        await rellenarCampo(driver, 'password', true);
        await rellenarCampo(driver, 'confirm_password');
        await rellenarCampo(driver, 'telefono');

        await driver.findElement(By.xpath('//*[@id="reg-btn"]')).click();

        const textoAlerta = await obtenerTextoAlerta(driver);
        assert.strictEqual(textoAlerta, '¡La contraseña debe tener al menos 5 caracteres!');
    });

    it('Registro fallido, las contraseñas no coinciden', async function() {
        await driver.wait(until.elementLocated(By.className('user-btn-no')), 10000);
        await driver.findElement(By.className('dropdown')).findElement(By.className('user-btn-no')).click();
        await driver.wait(until.elementLocated(By.xpath("/html/body/div/div/div[2]/div[1]/div/div[3]/div/div")), 10000);
        await driver.findElement(By.xpath('/html/body/div/div/div[2]/div[1]/div/div[3]/div/div/span[1]/a[1]')).click();

        await rellenarCampo(driver, 'nombre');
        await rellenarCampo(driver, 'apellidos');
        await rellenarCampo(driver, 'email');
        await rellenarCampo(driver, 'fecha');
        await rellenarCampo(driver, 'password');
        await rellenarCampo(driver, 'confirm_password', true);
        await rellenarCampo(driver, 'telefono');

        await driver.findElement(By.xpath('//*[@id="reg-btn"]')).click();

        const textoAlerta = await obtenerTextoAlerta(driver);
        assert.strictEqual(textoAlerta, '¡Las contraseñas no coinciden!');
    });

    afterEach(() => {
        driver.quit();
    });

    afte(() => {
        mysql.query('DELETE FROM usuarios WHERE email="prueba@gmail.com"');
    });
});

async function rellenarCampo(driver, campo, invalid=false) {

    var dato_campo = campo;

    if(invalid == true) {
        dato_campo = 'invalid_' +campo;
    }

    const campos = {
        nombre: '/html/body/div[3]/div/div/div[2]/div/form/div/div[1]/div[1]/div[1]/input',
        apellidos: '/html/body/div[3]/div/div/div[2]/div/form/div/div[1]/div[1]/div[2]/input',
        email: '/html/body/div[3]/div/div/div[2]/div/form/div/div[1]/div[1]/div[4]/input',
        fecha: '/html/body/div[3]/div/div/div[2]/div/form/div/div[1]/div[1]/div[5]/input',
        password: '/html/body/div[3]/div/div/div[2]/div/form/div/div[1]/div[2]/div[1]/input',
        confirm_password: '/html/body/div[3]/div/div/div[2]/div/form/div/div[1]/div[2]/div[2]/input',
        telefono: '/html/body/div[3]/div/div/div[2]/div/form/div/div[1]/div[2]/div[3]/div/input',
    };

    const element = await driver.findElement(By.xpath(campos[campo]));
    await driver.actions().sendKeys(element, datos_registro[dato_campo]).perform();
}