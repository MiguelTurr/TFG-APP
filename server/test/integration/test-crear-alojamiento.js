const { By, until, Key } = require('selenium-webdriver');
const assert = require('assert');
const { describe, it } = require('mocha');

//

const { crearDriver, obtenerTextoAlerta, crearCuentaDePrueba, borrarCuentaDePrueba, loginAccount, subirImagen } = require('../tools.js');

const datos_cuenta = {
    email: 'frank@app-tfg.com',
    password: '$2a$10$kxD.q52aHGC3BKIEMLVRVeqc1bPAtTbcJDu1lvDaF60gb0wOw41qy',
}

const datos_alojamiento = {
    titulo: 'Titulo de pruebaa para probar',
    descripcion: 'Descripcion de prueba para un alojamiento. Descripcion de prueba para un alojamiento. Descripcion de prueba para un alojamiento.',
    precio: 200,
    ubicacion: 'León, España',

    invalid_titulo: 'titulo corto',
    invalid_descripcion: 'descripcion corto',
};

//

describe('Crear un nuevo alojamiento', function () {

    var driver;
    this.timeout(10000);

    //

    before(async () => {
        await crearCuentaDePrueba();

        driver = await crearDriver();
        await loginAccount(driver);
        setTimeout(async () => { await driver.get('http://localhost:3000/perfil/mis-alojamientos/crear'); }, 2000);
    });

    it('Crear alojamiento fallido, formulario sin rellenar', async function () {
        await driver.wait(until.elementsLocated(By.xpath('//*[@id="crear-alojamiento"]')), 10000);
        await clickBotonCrear(driver);
        
        const textoAlerta = await obtenerTextoAlerta(driver);
        assert.strictEqual(textoAlerta, '¡Hay errores en el formulario!');
    });

    it('Crear alojamiento fallido, titulo demasiado corto', async function () {

        await new Promise((resolve) => {
            setTimeout(async () => {
                await colocarInput(driver, '//*[@id="titulo"]', datos_alojamiento.invalid_titulo);

                await driver.wait(until.elementsLocated(By.xpath('//*[@id="crear-alojamiento"]')), 10000);
                await clickBotonCrear(driver);

                resolve(true);
            }, 1000);
        });

        const elementWarning = await driver.findElement(By.xpath('/html/body/div/div/div[3]/form/div/div[1]/div[1]/div')).getAttribute('innerHTML');
        assert.strictEqual(elementWarning, '¡El título es demasiado corto!');
    });

    it('Crear alojamiento fallido, sin descripción', async function () {

        await new Promise((resolve) => {
            setTimeout(async () => {
                await colocarInput(driver, '//*[@id="titulo"]', datos_alojamiento.titulo);

                await driver.wait(until.elementsLocated(By.xpath('//*[@id="crear-alojamiento"]')), 10000);
                await clickBotonCrear(driver);

                resolve(true);
            }, 1000);
        });

        const elementWarning = await driver.findElement(By.xpath('/html/body/div/div/div[3]/form/div/div[1]/div[2]/div')).getAttribute('innerHTML');
        assert.strictEqual(elementWarning, '¡Debe tener una descripción!');
    });

    it('Crear alojamiento fallido, descripción demasiado corta', async function () {

        await new Promise((resolve) => {
            setTimeout(async () => {
                await colocarInput(driver, '//*[@id="descripcion"]', datos_alojamiento.invalid_descripcion);

                await driver.wait(until.elementsLocated(By.xpath('//*[@id="crear-alojamiento"]')), 10000);
                await clickBotonCrear(driver);

                resolve(true);
            }, 1000);
        });

        const elementWarning = await driver.findElement(By.xpath('/html/body/div/div/div[3]/form/div/div[1]/div[2]/div')).getAttribute('innerHTML');
        assert.strictEqual(elementWarning, '¡La descripción es demasiada corta!');
    });

    it('Crear alojamiento fallido, descripción demasiado corta', async function () {

        await new Promise((resolve) => {
            setTimeout(async () => {
                await colocarInput(driver, '//*[@id="descripcion"]', datos_alojamiento.descripcion);

                await driver.wait(until.elementsLocated(By.xpath('//*[@id="crear-alojamiento"]')), 10000);
                await clickBotonCrear(driver);

                resolve(true);
            }, 1000);
        });

        const textoAlerta = await obtenerTextoAlerta(driver);
        assert.strictEqual(textoAlerta, '¡Hay errores en el formulario!');
    });

    it('Crear alojamiento fallido, mal formato de imagen', async function () {

        await new Promise((resolve) => {
            setTimeout(async () => {
                await subirImagen(driver, 'prueba.txt', '//*[@id="imagenes"]');

                await driver.wait(until.elementsLocated(By.xpath('//*[@id="crear-alojamiento"]')), 10000);
                await clickBotonCrear(driver);

                resolve(true);
            }, 1000);
        });

        const elementWarning = await driver.findElement(By.xpath('/html/body/div/div/div[3]/form/div/div[2]/div[2]/div')).getAttribute('innerHTML');
        assert.strictEqual(elementWarning, '¡Una imagen no tiene el formato correcto!');
    });

    it('Crear alojamiento fallido, imagen demasiado pesada', async function () {

        await new Promise((resolve) => {
            setTimeout(async () => {
                await subirImagen(driver, 'imagen-pesada.jpg', '//*[@id="imagenes"]');

                await driver.wait(until.elementsLocated(By.xpath('//*[@id="crear-alojamiento"]')), 10000);
                await clickBotonCrear(driver);

                resolve(true);
            }, 1000);
        });

        const elementWarning = await driver.findElement(By.xpath('/html/body/div/div/div[3]/form/div/div[2]/div[2]/div')).getAttribute('innerHTML');
        assert.strictEqual(elementWarning, '¡El tamaño máximo por imagen es de 2 MB!');
    });

    it('Crear alojamiento fallido, sin ubicación', async function () {

        await new Promise((resolve) => {
            setTimeout(async () => {
                await subirImagen(driver, 'imagen-alojamiento.jpg', '//*[@id="imagenes"]');

                await driver.wait(until.elementsLocated(By.xpath('//*[@id="crear-alojamiento"]')), 10000);
                await clickBotonCrear(driver);

                resolve(true);
            }, 1000);
        });

        const textoAlerta = await obtenerTextoAlerta(driver);
        assert.strictEqual(textoAlerta, '¡Falta la ubicación!');
    });

    it('Crear alojamiento fallido, sin expecificar la ubicación exacta', async function () {

        await new Promise((resolve) => {
            setTimeout(async () => {

                await colocarInput(driver, '/html/body/div/div/div[3]/form/div/div[2]/div[1]/div[1]/div[1]/input', datos_alojamiento.ubicacion);
        
                await driver.wait(until.elementsLocated(By.xpath('/html/body/div/div/div[3]/form/div/div[2]/div[1]/div[1]/div[2]/ul/li[1]')), 10000);
                await driver.findElement(By.xpath('/html/body/div/div/div[3]/form/div/div[2]/div[1]/div[1]/div[2]/ul/li[1]')).click();

                await driver.wait(until.elementsLocated(By.xpath('//*[@id="crear-alojamiento"]')), 10000);
                await clickBotonCrear(driver);

                resolve(true);
            }, 1000);
        });

        const textoAlerta = await obtenerTextoAlerta(driver);
        assert.strictEqual(textoAlerta, '¡Expecifica la ubicación en el mapa!');
    });

    it('Crear alojamiento exitoso', async function () {

        await new Promise((resolve) => {
            setTimeout(async () => {
                await colocarInput(driver, '//*[@id="titulo"]', datos_alojamiento.titulo);
                await colocarInput(driver, '//*[@id="descripcion"]', datos_alojamiento.descripcion);

                const element = await driver.wait(until.elementLocated(By.xpath('//*[@id="precio"]')), 10000);
                for(var i = 0; i < datos_alojamiento.precio; i++) {
                    await element.sendKeys(Key.ARROW_RIGHT);
                }

                await subirImagen(driver, 'imagen-alojamiento.jpg', '//*[@id="imagenes"]');

                await colocarInput(driver, '/html/body/div/div/div[3]/form/div/div[2]/div[1]/div[1]/div[1]/input', datos_alojamiento.ubicacion);

                await driver.wait(until.elementsLocated(By.xpath('/html/body/div/div/div[3]/form/div/div[2]/div[1]/div[1]/div[2]/ul/li[1]')), 10000);
                await driver.findElement(By.xpath('/html/body/div/div/div[3]/form/div/div[2]/div[1]/div[1]/div[2]/ul/li[1]')).click();

                await driver.wait(until.elementsLocated(By.xpath('/html/body/div/div/div[3]/form/div/div[2]/div[1]/div[2]/div/div/div/div[2]/div[2]')), 10000);
                await driver.findElement(By.xpath('/html/body/div/div/div[3]/form/div/div[2]/div[1]/div[2]/div/div/div/div[2]/div[2]')).click();

                await clickBotonCrear(driver);

                resolve(true);
            }, 1000);
        });
        
        const textoAlerta = await obtenerTextoAlerta(driver);
        assert.strictEqual(textoAlerta, '¡Has creado un nuevo alojamiento!');
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

async function clickBotonCrear(driver) {

    const btn = await driver.findElement(By.xpath('//*[@id="crear-alojamiento"]'));
    await driver.executeScript("arguments[0].scrollIntoView(true);", btn);

    await new Promise((resolve) => { 
        setTimeout(async () => { await btn.click(); resolve(true); }, 1000);
    });
}