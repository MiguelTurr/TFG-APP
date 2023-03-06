const { By, until } = require('selenium-webdriver');
const assert = require('assert');
const { describe, it } = require('mocha');

//

const { crearDriver, obtenerTextoAlerta, crearCuentaDePrueba, loginAccount, borrarCuentaDePrueba, subirImagen } = require('../tools.js');

const datos_login = {
    email: 'frank@app-tfg.com',
    password: 'frank',
};

const datos_editar = {
    trabajo: 'Barrendero',
    email: 'francisco@app-tfg.com',
    password: 'nuevapassword',

    invalid_email: 'franciscoapp-tfg.com',
    invalid_password: 'n',
}

//

describe.skip('Editar perfil usuario', function () {

    var driver;
    this.timeout(10000);

    //

    before(async () => {
        await crearCuentaDePrueba();

        driver = await crearDriver();
        await loginAccount(driver);
        setTimeout(async () => { await driver.get('http://localhost:3000/perfil/'); }, 2000);
    });

    it('Modificar trabajo exitoso', async function () {
        
        await driver.wait(until.elementLocated(By.xpath("/html/body/div/div/div[3]/div[2]/div[1]/table[1]/tbody/tr[6]")), 10000);
        await driver.findElement(By.xpath('/html/body/div/div/div[3]/div[2]/div[1]/table[1]/tbody/tr[6]')).click();
        
        await colocarInput(driver, '//*[@id="mod-trabajo"]', datos_editar.trabajo);
        await colocarInput(driver, '//*[@id="mod-password-2"]', datos_login.password);

        await driver.findElement(By.xpath('//*[@id="mod-btn"]')).click();

        const textoAlerta = await obtenerTextoAlerta(driver);
        assert.strictEqual(textoAlerta, '¡Los datos han sido actualizados!');
    });

    it('Modificar trabajo fallido, contraseña es incorrecta', async function () {
        
        await driver.wait(until.elementLocated(By.xpath("/html/body/div/div/div[3]/div[2]/div[1]/table[1]/tbody/tr[6]")), 10000);
        await driver.findElement(By.xpath('/html/body/div/div/div[3]/div[2]/div[1]/table[1]/tbody/tr[6]')).click();

        await colocarInput(driver, '//*[@id="mod-trabajo"]', datos_editar.trabajo);
        await colocarInput(driver, '//*[@id="mod-password-2"]', 'prueba');

        await driver.findElement(By.xpath('//*[@id="mod-btn"]')).click();

        const textoAlerta = await obtenerTextoAlerta(driver);
        assert.strictEqual(textoAlerta, '¡La contraseña no es la correcta!');
    });

    it('Modificar email exitoso', async function () {
        await driver.findElement(By.xpath('//*[@id="vista-1"]')).click();
        
        await driver.wait(until.elementLocated(By.xpath("/html/body/div/div/div[3]/div[2]/div[1]/table[1]/tbody/tr[6]")), 10000);
        await driver.findElement(By.xpath('/html/body/div/div/div[3]/div[2]/div[1]/table[2]/tbody/tr[2]/td[1]')).click();

        await colocarInput(driver, '//*[@id="mod-email"]', datos_editar.email);
        await colocarInput(driver, '//*[@id="mod-password-2"]', datos_login.password);

        await driver.findElement(By.xpath('//*[@id="mod-btn"]')).click();

        const textoAlerta = await obtenerTextoAlerta(driver);
        assert.strictEqual(textoAlerta, '¡Los datos han sido actualizados!');
    });

    it('Modificar email fallido, el campo está vacío', async function () {
        await driver.findElement(By.xpath('/html/body/div/div/div[3]/div[2]/div[1]/table[2]/tbody/tr[2]/td[1]')).click();

        await colocarInput(driver, '//*[@id="mod-email"]', '');
        await colocarInput(driver, '//*[@id="mod-password-2"]', datos_login.password);

        await driver.findElement(By.xpath('//*[@id="mod-btn"]')).click();

        const textoAlerta = await obtenerTextoAlerta(driver);
        assert.strictEqual(textoAlerta, '¡Escribe algo primero!');
    });

    it('Modificar email fallido, el formato del email no es válido', async function () {
        await driver.findElement(By.xpath('/html/body/div/div/div[3]/div[2]/div[1]/table[2]/tbody/tr[2]/td[1]')).click();

        await colocarInput(driver, '//*[@id="mod-email"]', datos_editar.invalid_email);
        await colocarInput(driver, '//*[@id="mod-password-2"]', datos_login.password);

        await driver.findElement(By.xpath('//*[@id="mod-btn"]')).click();

        const errorMessage = await driver.findElement(By.xpath('//*[@id="mod-email"]')).getAttribute('validationMessage');
        assert.strictEqual(errorMessage, 'Introduzca una dirección de correo.');
    });

    it('Modificar email fallido, contraseña vacía', async function () {
        await driver.findElement(By.xpath('/html/body/div/div/div[3]/div[2]/div[1]/table[2]/tbody/tr[2]/td[1]')).click();

        await colocarInput(driver, '//*[@id="mod-email"]', datos_editar.email);
        await colocarInput(driver, '//*[@id="mod-password-2"]', '');

        await driver.findElement(By.xpath('//*[@id="mod-btn"]')).click();

        const textoAlerta = await obtenerTextoAlerta(driver);
        assert.strictEqual(textoAlerta, '¡Escribe tu contraseña para confirmar!');
    });

    it('Modificar foto de perfil exitoso', async function () {
        await driver.findElement(By.xpath('/html/body/div/div/div[3]/div[2]/div[1]/table[2]/tbody/tr[5]/td[1]')).click();

        await colocarInput(driver, '//*[@id="mod-password-2"]', datos_login.password);

        await subirImagen(driver, 'perfil.jpg', '//*[@id="mod-imagen"]');

        await driver.findElement(By.xpath('//*[@id="mod-btn"]')).click();

        const textoAlerta = await obtenerTextoAlerta(driver);
        assert.strictEqual(textoAlerta, '¡Los datos han sido actualizados!');
    });

    it('Modificar foto de perfil fallido, formato de archivo inválido', async function () {
        await driver.findElement(By.xpath('/html/body/div/div/div[3]/div[2]/div[1]/table[2]/tbody/tr[5]/td[1]')).click();

        await colocarInput(driver, '//*[@id="mod-password-2"]', datos_login.password);

        await subirImagen(driver, 'prueba.txt', '//*[@id="mod-imagen"]');

        await driver.findElement(By.xpath('//*[@id="mod-btn"]')).click();

        const textoAlerta = await obtenerTextoAlerta(driver);
        assert.strictEqual(textoAlerta, '¡Sólo formato .png o .jpg!');
    });

    it('Modificar foto de perfil fallido, imagen de demasiado peso', async function () {
        await driver.findElement(By.xpath('/html/body/div/div/div[3]/div[2]/div[1]/table[2]/tbody/tr[5]/td[1]')).click();

        await colocarInput(driver, '//*[@id="mod-password-2"]', datos_login.password);

        await subirImagen(driver, 'imagen-pesada.jpg', '//*[@id="mod-imagen"]');

        await driver.findElement(By.xpath('//*[@id="mod-btn"]')).click();

        const textoAlerta = await obtenerTextoAlerta(driver);
        assert.strictEqual(textoAlerta, '¡La imagen debe pesar menos de 2 MB!');
    });

    it('Eliminar foto de perfil exitoso', async function () {
        await driver.findElement(By.xpath('/html/body/div/div/div[3]/div[2]/div[1]/table[2]/tbody/tr[5]/td[1]')).click();

        await colocarInput(driver, '//*[@id="mod-password-2"]', datos_login.password);

        await driver.findElement(By.xpath('/html/body/div/div/div[3]/div[2]/div[2]/form/div[11]/button[2]')).click();

        const textoAlerta = await obtenerTextoAlerta(driver);
        assert.strictEqual(textoAlerta, '¡Ahora ya no tienes imagen de perfil!');
    });

    it('Modificar contraseña exitoso', async function () {
        await driver.findElement(By.xpath('/html/body/div/div/div[3]/div[2]/div[1]/table[2]/tbody/tr[3]/td[1]')).click();

        await colocarInput(driver, '//*[@id="mod-password"]', datos_editar.password);
        await colocarInput(driver, '//*[@id="mod-password-2"]', datos_login.password);

        await driver.findElement(By.xpath('//*[@id="mod-btn"]')).click();

        const textoAlerta = await obtenerTextoAlerta(driver);
        assert.strictEqual(textoAlerta, '¡Los datos han sido actualizados!');
    });

    it('Modificar contraseña fallida, hay pocos caracteres', async function () {
        await driver.findElement(By.xpath('/html/body/div/div/div[3]/div[2]/div[1]/table[2]/tbody/tr[3]/td[1]')).click();

        await colocarInput(driver, '//*[@id="mod-password"]', datos_editar.invalid_password);
        await colocarInput(driver, '//*[@id="mod-password-2"]', datos_login.password);

        await driver.findElement(By.xpath('//*[@id="mod-btn"]')).click();

        const textoAlerta = await obtenerTextoAlerta(driver);
        assert.strictEqual(textoAlerta, '¡La contraseña debe tener al menos 5 caracteres!');
    });

    after(() => {
        driver.quit();
        borrarCuentaDePrueba();
    });
});

async function colocarInput(driver, xpath, input) {

    await driver.wait(until.elementLocated(By.xpath(xpath)), 10000);
        
    const element = await driver.findElement(By.xpath(xpath));
    element.clear();
    await driver.actions().sendKeys(element, input).perform();
}