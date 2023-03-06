const { By, until, Key } = require('selenium-webdriver');
const assert = require('assert');
const { describe, it } = require('mocha');

//

const { crearDriver, obtenerTextoAlerta, crearCuentaDePrueba, crearAlojamientoDePrueba, loginAccount, borrarCuentaDePrueba, subirImagen } = require('../tools.js');

const datos_editar = {
    titulo: 'Cambio de titulo',
    descripcion: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. \
    Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. \
    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. \
    Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    precio: 20,
}

//

describe.skip('Editar alojamiento', function () {

    var driver;
    this.timeout(10000);

    //

    before(async () => {

        await crearCuentaDePrueba();
        await crearAlojamientoDePrueba();

        driver = await crearDriver();
        await loginAccount(driver);
        setTimeout(async () => { await driver.get('http://localhost:3000/perfil/mis-alojamientos'); }, 2000);
    });

    it('Modificar título exitoso', async function () {

        await driver.wait(until.elementLocated(By.xpath("/html/body/div/div/div[3]/table/tbody/tr/td")), 10000);
        await driver.findElement(By.xpath('/html/body/div/div/div[3]/table/tbody/tr/td')).click(); 

        await driver.wait(until.elementLocated(By.xpath("/html/body/div/div/div[3]/div/div[1]/table/tbody/tr[3]")), 10000);
        await driver.findElement(By.xpath('/html/body/div/div/div[3]/div/div[1]/table/tbody/tr[3]')).click();

        await colocarInput(driver, '//*[@id="titulo"]', datos_editar.titulo);

        await driver.wait(until.elementLocated(By.xpath('//*[@id="mod-btn"]')), 10000);
        await driver.findElement(By.xpath('//*[@id="mod-btn"]')).click();

        const textoAlerta = await obtenerTextoAlerta(driver);
        assert.strictEqual(textoAlerta, '¡Dato modificado!');
    });

    it('Modificar descripcion exitoso', async function () {
        await driver.wait(until.elementLocated(By.xpath("/html/body/div/div/div[3]/div/div[1]/table/tbody/tr[4]")), 10000);
        await driver.findElement(By.xpath('/html/body/div/div/div[3]/div/div[1]/table/tbody/tr[4]')).click();

        await colocarInput(driver, '//*[@id="descripcion"]', datos_editar.descripcion);

        await driver.wait(until.elementLocated(By.xpath('//*[@id="mod-btn"]')), 10000);
        await driver.findElement(By.xpath('//*[@id="mod-btn"]')).click();

        const textoAlerta = await obtenerTextoAlerta(driver);
        assert.strictEqual(textoAlerta, '¡Dato modificado!');
    });

    it('Modificar precio exitoso', async function () {
        await driver.wait(until.elementLocated(By.xpath("/html/body/div/div/div[3]/div/div[1]/table/tbody/tr[5]")), 10000);
        await driver.findElement(By.xpath('/html/body/div/div/div[3]/div/div[1]/table/tbody/tr[5]')).click();

        const element = await driver.wait(until.elementLocated(By.xpath('//*[@id="coste"]')), 10000);
        for(var i = 0; i < datos_editar.precio; i++) {
            element.sendKeys(Key.ARROW_LEFT);
        }

        await driver.wait(until.elementLocated(By.xpath('//*[@id="mod-btn"]')), 10000);
        await driver.findElement(By.xpath('//*[@id="mod-btn"]')).click();

        const textoAlerta = await obtenerTextoAlerta(driver);
        assert.strictEqual(textoAlerta, '¡Dato modificado!');
    });

    it('Modificar alojamiento exitoso', async function () {
        await driver.wait(until.elementLocated(By.xpath("/html/body/div/div/div[3]/div/div[1]/table/tbody/tr[6]")), 10000);
        await driver.findElement(By.xpath('/html/body/div/div/div[3]/div/div[1]/table/tbody/tr[6]')).click();

        await driver.wait(until.elementLocated(By.xpath('//*[@id="viajeros-suma"]')), 10000);
        await driver.findElement(By.xpath('//*[@id="viajeros-suma"]')).click();
        await driver.findElement(By.xpath('//*[@id="viajeros-suma"]')).click();

        await driver.findElement(By.xpath('//*[@id="aseos-suma"]')).click();

        await driver.findElement(By.xpath('//*[@id="cocina"]')).click();
        await driver.findElement(By.xpath('//*[@id="mascotas"]')).click();
        await driver.findElement(By.xpath('//*[@id="lavadora"]')).click();
        await driver.findElement(By.xpath('//*[@id="television"]')).click();

        await driver.findElement(By.xpath('//*[@id="mod-btn"]')).click();

        const textoAlerta = await obtenerTextoAlerta(driver);
        assert.strictEqual(textoAlerta, '¡Dato modificado!');
    });

    it('Modificar fuente exitoso', async function () {

        await driver.wait(until.elementLocated(By.xpath("/html/body/div/div/div[3]/div/div[1]/table/tbody/tr[7]")), 10000);
        await driver.findElement(By.xpath('/html/body/div/div/div[3]/div/div[1]/table/tbody/tr[7]')).click(); 

        await driver.wait(until.elementLocated(By.xpath('//*[@id="fuente-6"]')), 10000);
        await driver.findElement(By.xpath('//*[@id="fuente-6"]')).click(); 

        await driver.findElement(By.xpath('//*[@id="mod-btn"]')).click();

        const textoAlerta = await obtenerTextoAlerta(driver);
        assert.strictEqual(textoAlerta, '¡Dato modificado!');
    });

    it('Añadir imagen fallido, formato de archivo inválido', async function () {
        await driver.wait(until.elementLocated(By.xpath("/html/body/div/div/div[3]/div/div[1]/table/tbody/tr[8]")), 10000);
        await driver.findElement(By.xpath('/html/body/div/div/div[3]/div/div[1]/table/tbody/tr[8]')).click();

        await subirImagen(driver, 'prueba.txt', '//*[@id="imagenes-edit"]');

        await driver.wait(until.elementLocated(By.xpath('//*[@id="mod-btn"]')), 10000);
        await driver.findElement(By.xpath('//*[@id="mod-btn"]')).click();

        const textoAlerta = await obtenerTextoAlerta(driver);
        assert.strictEqual(textoAlerta, '¡Una imagen no tiene el formato correcto!');
    });

    it('Añadir imagen fallido, imagen de demasiado peso', async function () {

        await subirImagen(driver, 'imagen-pesada.jpg', '//*[@id="imagenes-edit"]');

        await driver.wait(until.elementLocated(By.xpath('//*[@id="mod-btn"]')), 10000);
        await driver.findElement(By.xpath('//*[@id="mod-btn"]')).click();

        const textoAlerta = await obtenerTextoAlerta(driver);
        assert.strictEqual(textoAlerta, '¡El tamaño máximo por imagen es de 2 MB!');
    });

    it('Añadir imagen exitoso', async function () {

        await subirImagen(driver, 'imagen-alojamiento.jpg', '//*[@id="imagenes-edit"]');

        await driver.findElement(By.xpath('//*[@id="mod-btn"]')).click();

        const textoAlerta = await obtenerTextoAlerta(driver);
        assert.strictEqual(textoAlerta, '¡Dato modificado!');
    });

    after(() => {
        driver.quit();
        borrarCuentaDePrueba();
    });
});

async function colocarInput(driver, xpath, input) {

    const element = await driver.wait(until.elementLocated(By.xpath(xpath)), 10000);
    element.clear();
    await driver.actions().sendKeys(element, input).perform();
}