const puppeteer = require('puppeteer');
 
function getDate() {
    let date = new Date();
    let fullDate = date.getFullYear() + "-" + date.getMonth() + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
    return fullDate;
}
 
async function webScraper(url) {
    const browser = await puppeteer.launch({});
    const page = await browser.newPage();
 
    await page.goto(url);
    
    var product = await page.waitForSelector("#/html/body/div[1]/div[2]/section/main/div[3]/div[2]/div[1]/div/div[6]/ul/div[1]/div[1]");
    var productText = await page.evaluate(product => product.textContent, product);
    var price = await page.waitForSelector("/html/body/div[1]/div[2]/section/main/div[3]/div[2]/div[1]/div/div[6]/ul/div[1]/div[1]");
    var priceText = await page.evaluate(price => price.textContent, price);
    
    console.log("Date: " + getDate());
    console.log("Product: " + productText);
    console.log("Price: " + priceText);
    
    browser.close();
};
 
webScraper('https://groceries.asda.com/search/breakfast%20muffin');