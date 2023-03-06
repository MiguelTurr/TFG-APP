const { By, until, Key } = require('selenium-webdriver');
const assert = require('assert');
const { describe, it } = require('mocha');

//

const { crearDriver, obtenerTextoAlerta, crearCuentaDePrueba, borrarCuentaDePrueba, loginAccount, subirImagen } = require('../tools.js');

//

describe.skip('Mensajes a usuarios', function () {

    var driver;
    this.timeout(10000);

    //

    before(async () => {
        await crearCuentaDePrueba();
        await crearCuentaDePrueba(1);

        driver = await crearDriver();
        await loginAccount(driver);
    });

    it('Error usuario no existe', async function () {

        await new Promise((resolve) => {
            setTimeout(async () => { 
                await driver.get('http://localhost:3000/perfil/mis-chats/22');
                resolve(true);
            }, 2000);
        });
        
        const textoAlerta = await obtenerTextoAlerta(driver);
        assert.strictEqual(textoAlerta, '¡Ha ocurrido un error con la base de datos!');
    });

    it('Enviar un mensaje a un usuario', async function () {

        await new Promise((resolve) => {
            setTimeout(async () => { 
                await driver.get('http://localhost:3000/perfil/mis-chats/11');
                resolve(true);
            }, 2000);
        });

        const element = await driver.wait(until.elementLocated(By.xpath('/html/body/div/div/div[3]/div/div[2]/form/input')), 10000);
        element.clear();
        await driver.actions().sendKeys(element, 'Mensaje de prueba en el chat').perform();

        await driver.wait(until.elementLocated(By.css("svg.svg-inline--fa:nth-child(4)")), 10000);
        const enviar = await driver.findElement(By.css("svg.svg-inline--fa:nth-child(4)"));
        await enviar.click();

        await driver.wait(until.elementLocated(By.xpath("/html/body/div/div/div[3]/div/div[2]/div[2]/span/div[2]")), 10000);
        const mensaje = await driver.findElement(By.xpath("/html/body/div/div/div[3]/div/div[2]/div[2]/span/div[2]")).getAttribute('innerHTML');
        
        assert.strictEqual(mensaje.slice(0, 28), 'Mensaje de prueba en el chat');
    });

    it('Enviar un emoticono a un usuario', async function () {

        await driver.wait(until.elementLocated(By.css("svg.svg-inline--fa:nth-child(2)")), 10000);
        const abrirIconos = await driver.findElement(By.css("svg.svg-inline--fa:nth-child(2)"));
        await abrirIconos.click();

        await driver.wait(until.elementLocated(By.css(".icon-list > span:nth-child(16) > span:nth-child(1)")), 10000);
        const emoticono = await driver.findElement(By.css(".icon-list > span:nth-child(16) > span:nth-child(1)"));
        await emoticono.click();
        await emoticono.click();
        await emoticono.click();

        await new Promise((resolve) => {
            setTimeout(async () => { 
                await abrirIconos.click();
                resolve(true);
            }, 1000);
        });

        await driver.wait(until.elementLocated(By.css("svg.svg-inline--fa:nth-child(4)")), 10000);
        const enviar = await driver.findElement(By.css("svg.svg-inline--fa:nth-child(4)"));
        await enviar.click();
        
        await driver.wait(until.elementLocated(By.xpath("/html/body/div/div/div[3]/div/div[2]/div[2]/span[2]/div")), 10000);
        const mensaje = await driver.findElement(By.xpath("/html/body/div/div/div[3]/div/div[2]/div[2]/span[2]/div")).getAttribute('innerHTML');

        assert.strictEqual(mensaje.slice(0, 6), '💓💓💓');
    });

    it('Enviar una imagen, formato de imagen inválido', async function () {

        await subirImagen(driver, 'prueba.txt', '/html/body/div/div/div[3]/div/div[2]/input');
        
        const textoAlerta = await obtenerTextoAlerta(driver);
        assert.strictEqual(textoAlerta, '¡Ese formato de imagen no es válido!');
    });

    it('Enviar una imagen, tamaño de imagen muy pesado', async function () {

        await subirImagen(driver, 'imagen-pesada.jpg', '/html/body/div/div/div[3]/div/div[2]/input');
        
        const textoAlerta = await obtenerTextoAlerta(driver);
        assert.strictEqual(textoAlerta, '¡El tamaño máximo por imagen es de 2 MB!');
    });

    it('Enviar una imagen exitoso', async function () {

        await subirImagen(driver, 'imagen-alojamiento.jpg', '/html/body/div/div/div[3]/div/div[2]/input');

        await driver.wait(until.elementLocated(By.xpath("/html/body/div/div/div[3]/div/div[2]/div[2]/span[3]/div")), 10000);
        const mensaje = await driver.findElement(By.xpath("/html/body/div/div/div[3]/div/div[2]/div[2]/span[3]/div")).getAttribute('innerHTML');

        assert.strictEqual(mensaje.slice(0, 23), '<svg aria-hidden="true"');
    });

    after(() => {
        driver.quit();
        borrarCuentaDePrueba();
        borrarCuentaDePrueba(1);
    });
});
