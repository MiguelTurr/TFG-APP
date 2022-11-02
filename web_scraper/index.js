const cheerio = require('cheerio');
const fetch = require('node-fetch');
const {Builder, Browser, By, Key, until} = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');

//

//const url = 'https://www.airbnb.es/';
const url = 'https://google.es';

//

async function prueba() {

    console.log('AA');

    let driver = await new Builder().forBrowser(Browser.FIREFOX).build();

    console.log('AA');

    try {

        await driver.get(url);
        await driver.findElement(By.name('q')).sendKeys('webdriver', Key.RETURN);


        /*const element = await driver.findElement(By.id('site-content'));
        const element_text = await element.getText();

        console.log(element_text);*/

        /*await driver.findElement(By.id('site-content').then((element) => {
            element.getText().then((text) => {
                console.log(text);

                console.log('AA');
            });
        }));*/


    } finally {
        await driver.quit();
    }

    /*const response = await fetch(url);
    const body = await response.text();

    console.log(body);
    
    const $ = cheerio.load(body);*/

    //

    //console.log($.html());

    /*$('.gh7uyir > .dir').each((i, el) => {
        //console.log(i);
        //console.log($(el).html());

        //console.log($(el).find('meta[itemprop="name"]').attr('content'));

        if(i == 0) {
            //console.log($(el).find('.dir > .dir > meta[itemprop="name"]').attr('content'));
            //console.log($(el).find('.cy5jw6o').attr('href'));

            //console.log($(el).find('.c4mnd7m').html());
            //console.log($(el).find('.c4mnd7m').length);

            //console.log($(el).find('.c4mnd7m > div').html());
            //console.log($(el).find('.c4mnd7m > div').length);
            console.log($(el).find('.cy5jw6o').html());
            console.log($(el).find('.cy5jw6o').length);
        }
    });*/

    //console.log($('.gh7uyir').html());
}

prueba();