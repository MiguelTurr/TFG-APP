const cheerio = require('cheerio');
const {Builder, Browser, By, Key, until} = require('selenium-webdriver');
const fs = require('fs');
const http = require('https');

//

const max_usurios = 5;
const scroll_max = 5;
const scroll_timer_time = 3000;
const render_time = scroll_max * scroll_timer_time;
const url = 'https://www.airbnb.es/';

var casas = 0;

scapHome();

//

async function scapHome() {

    let driver = await new Builder().forBrowser(Browser.FIREFOX).build();

    try {

        await driver.get(url);
        await driver.wait(until.elementLocated(By.xpath("//meta[contains(@itemprop, 'name')]")), 10000);

        await driver.findElement(By.className('czcfm7x')).click();

        // SCROLL HACIA ABAJO
        // PARA RENDERIZAR MÁS ELEMENTOS

        var scroll_time = 0;
        var scroll_timer = setInterval(async() => {

            var scroll_final = 15 * (scroll_time + 1);

            //console.log(await driver.executeScript("return document.querySelectorAll('.gh7uyir > .dir-ltr').length"));

            await driver.executeScript("document.querySelectorAll('.gh7uyir > div > .dir-ltr')["+scroll_final+"].scrollIntoView({ behavior: 'smooth', block: 'start' })");
            
            scroll_time ++;

            if(scroll_time >= scroll_max) {
                clearInterval(scroll_timer);
            }
        }, scroll_timer_time);

        // CAPTURA TODO LO RENDERIZADO

        setTimeout(async () => {
            
            const element = await driver.findElement(By.id('site-content'));
            const element_text = await element.getAttribute('innerHTML');

            console.log('-----------------------------------------------------');

            const $ = cheerio.load(element_text);

            var element_for = $('.gh7uyir > div > .dir');
            var len = element_for.length;

            for(let i = 0; i < len; i++) {
                
                var nombre = $(element_for[i]).find('meta[itemprop="name"]').attr('content');

                if(nombre != undefined) {
                    var url = $(element_for[i]).find('meta[itemprop="url"]').attr('content');
                    await scrapPlace('https://' +url);
                }
            }

        }, render_time);

    } finally {
        //await driver.quit();
    }
}

async function scrapPlace(url) {

    return new Promise(async (resolve) => {

        let driver = await new Builder().forBrowser(Browser.FIREFOX).build();

        //

        await driver.get(url);

        setTimeout(async () => {

            try {
                var pop_up = await driver.findElement(By.className('_1ucy1zjv'));
                if(pop_up != null) {
                    await driver.findElement(By.className('_oda838')).click();
                }

            } catch(NoSuchElementException) {

            }

            await driver.wait(until.elementLocated(By.className('c1taamis')), 10000);
            
            //

            const element = await driver.findElement(By.id('site-content'));
            const element_text = await element.getAttribute('innerHTML');

            console.log('-----------------------------------------------------');

            const $ = cheerio.load(element_text);
        
            //

            var info = {};

            info.titulo = $('._fecoyn4').text();

            //someText = someText.replace(/(\r\n|\n|\r)/gm, "");
            // QUITAR DE TITULO SI TIENE \n

            info.ubicacion = $('._9xiloll').text();
            info.descripcion = $('._vd6w38n').find('.ll4r2nl').html();
            info.precio = $('._c7v1se').find('.a8jt5op').text().split(' ')[0].split(String.fromCharCode(160))[0];

            // ESPECIFICACIONES

            var index = 0;

            $('._tqmy57').find('.lgx66tx').find('.l7n4lsf').each((i, el) => {

                $(el).find('span').each((i, el) => {

                    if(index == 0 && i == 0) {
                        info.personas = $(el).text().split(String.fromCharCode(160))[0];

                    } else if(i == 2) {

                        if(index == 1) {
                            info.habitaciones = $(el).text().split(' ')[0];

                        } else if(index == 2) {
                            info.camas = $(el).text().split(' ')[0];

                        } else if(index == 3) {
                            info.bathroom = $(el).text().split(' ')[0];
                        }
                    }
                });

                index++;
            });

            // SERVICIOS

            info.servicios = {
                cocina: false,
                wifi: false,
                animales: false,
                aparcamiento: false,
                piscina: false,
                lavadora: false,
                aire_acondicionado: false,
                calefaccion: false,
                television: false
            };

            var final_str = '';

            $('._1byskwn').find('._19xnuo97').each((i, el) => {

                var servicio = $(el).find('.iikjzje').find('div').text();

                if(servicio == 'Cocina') {
                    info.servicios.cocina = true;
                    final_str += 'Cocina, ';

                } else if(servicio == 'Wifi') {
                    info.servicios.wifi = true;
                    final_str += 'Wifi, ';

                } else if(servicio.includes('Aparcamiento')) {
                    info.servicios.aparcamiento = true;
                    final_str += 'Aparcamiento, ';

                } else if(servicio.includes('Piscina')) {
                    info.servicios.piscina = true;
                    final_str += 'Piscina, ';

                } else if(servicio.includes('Lavadora')) {
                    info.servicios.lavadora = true;
                    final_str += 'Lavadora, ';

                } else if(servicio == 'Admite mascotas') {
                    info.servicios.animales = true;
                    final_str += 'Mascotas, ';

                } else if(servicio.includes('Calefacción')) {
                    info.servicios.calefaccion = true;
                    final_str += 'Calefacción, ';

                } else if(servicio.includes('Televisión')) {
                    info.servicios.television = true;
                    final_str += 'Televisión, ';

                } else if(servicio.includes('Aire acondicionado')) {
                    info.servicios.aire_acondicionado = true;
                    final_str += 'Aire acondicionado, ';
                }
            });

            console.log('SERVICIOS: ' +final_str);

            // NORMAS

            info.normas = {
                hora_llegada: null,
                hora_salida: null,
                fumar: true,
                fiestas: true,
            }

            $('.c1taamis').find('.i1303y2k').each((i, el) => {

                var texto = $(el).find('span').text();

                if(texto.includes('Llegada')) {
                    info.normas.hora_llegada = texto.split(' ')[1];
                    console.log(info.normas.hora_llegada);

                } else if(texto.includes('Salida')) {
                    info.normas.hora_salida = texto.split(' ')[1];
                    console.log(info.normas.hora_salida);

                } else if(texto.includes('Prohibido fumar')) {
                    info.normas.fumar = false;
                    console.log(texto);

                } else if(texto.includes('No se admiten fiestas o eventos')) {
                    info.normas.fiestas = false;
                    console.log(texto);
                }
            });

            //

            console.log(info.personas+ ' personas, ' +info.habitaciones+ ' habitaciones, ' +info.camas+ ' camas, ' +info.bathroom+ ' baños');

            console.log('TÍTULO: ' +info.titulo);
            console.log('UBICACIÓN: ' +info.ubicacion);
            console.log('DESCRIPCION: ' +info.descripcion);
            console.log('PRECIO: ' +info.precio);

            scrapFile(info);

            //

            var imagenes = [];

            $('._skzmvy').find('button').each((i, el) => {

                var img = $(el).find('picture').children('source').attr('srcset').split(' ')[0];
                console.log(img);

                var text_img = 'casa_' +casas+ '_' +i+ '.jpg';
    
                imagenes.push(text_img);
                downloadIMG(img, text_img);
            });

            //

            scrapIMG(imagenes);
            casas++;

            //
        
            await driver.quit();

            resolve(true);
        }, 3000);
    });
}

function scrapFile(data) {

    var str = '';

    str += Math.floor(Math.random() * max_usurios) + '|';
    str += data.titulo+ '|';

    var descripcionFinal = (data.descripcion == null) ? 'Escribe una descripción...' : data.descripcion;

    str += descripcionFinal+ '|';
    str += data.precio+ '|';
    str += data.ubicacion+ '|';
    str += data.personas+ '|' +data.habitaciones+ '|' +data.camas+ '|' +data.bathroom+ '|';

    // NORMAS

    var hora_llegada = data.normas.hora_llegada;
    var hora_salida = data.normas.hora_salida;

    var patterm = new RegExp('^[0-9]+$');

    if(hora_llegada == '' || patterm.test(hora_llegada) == false) {
        hora_llegada = null;
    }

    if(hora_salida == '' || patterm.test(hora_salida) == false) {
        hora_salida = null;
    }

    str += hora_llegada+ '|' +hora_salida+ '|';
    str += (data.normas.fumar == true ? 1 : 0)+ '|' +(data.normas.fiestas == true ? 1 : 0)+ '|';

    // SERVICIOS

    var servicios_final = 0;
    
    servicios_final |= data.servicios.cocina << 8;
    servicios_final |= data.servicios.wifi << 7;
    servicios_final |= data.servicios.animales << 6;
    servicios_final |= data.servicios.aparcamiento << 5;
    servicios_final |= data.servicios.piscina << 4;
    servicios_final |= data.servicios.lavadora << 3;
    servicios_final |= data.servicios.aire_acondicionado << 2;
    servicios_final |= data.servicios.calefaccion << 1;
    servicios_final |= data.servicios.television;

    str += servicios_final+ '\n';

    //

    fs.appendFile('./scrap_data.txt', str, error => {

        if (error) {
            console.log(error);
            return;
        }
    });
}

function scrapIMG(img) {

    var str = '';

    var len = img.length;

    for(var i = 0; i < len; i++) {
        str += (casas + 1)+ '|';
        str += img[i]+ '\n';
    }

    fs.appendFile('./scrap_img.txt', str, error => {

        if (error) {
            console.log(error);
            return;
        }
    });
}

function downloadIMG(uri, filename){

    const file = fs.createWriteStream('./imagenes/' +filename);

    const request = http.get(uri, function(response) {
        response.pipe(file);

        file.on("finish", () => {
            file.close();
        });
    });
};