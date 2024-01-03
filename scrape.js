//Require for Puppeteer 'required'

const puppeteer = require('puppeteer');
//async to allow the usage of 'wait' so that the code has to wait for this to complete before moving on
(async () => {
  
  const browser = await puppeteer.launch();

  const page = await browser.newPage();

  try {
    const url = 'https://groceries.asda.com/product/baking-jacket-potatoes/asda-british-fluffy-golden-large-baking-potatoes/24932'; // Replace with the URL you want to visit
    await page.goto(url);
    //maybe need to add a wait here 
    //Add a wait with a specified time to prevent early timeout if the page takes too long to load
    await new Promise((resolve) => setTimeout(resolve, 3000))

    // ASDA Scrape
    // ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    
    //Product Name
    const xpath = '//*[@id="main-content"]/main/div[3]/div[2]/div[1]/div/div[1]/h1'; 
    const productName = await page.evaluate((xpath) => {
      const element = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
      return element ? element.textContent.trim() : null;
    }, xpath);


    // If products go on offer at the time of searching, the original price class changes to the offer price.
    // Its possible the original price id new labled to was-price but need to check this.
    // If this is true, need to set up a search to look for original price if there is an offer first.


    //Product Price
    const pricexpath = '//*[@id="main-content"]/main/div[3]/div[2]/div[1]/div/div[3]/div/div/strong/text()'; 
    const pricevalue = await page.evaluate((pricexpath) => {
      const element = document.evaluate(pricexpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
      return element ? element.textContent.trim() : null;
    }, pricexpath);
     
    
    // Product allNutritionRows
    // Xpath using the class that seams to be universal for each nutritional row: (Refer to README for more info)
    const allNutritionRowsxpath = '//div[@class="pdp-description-reviews__nutrition-row pdp-description-reviews__nutrition-row--details"]';
    // Getting all the Nutritional Values
    const allNutritionRowsvalue = await page.evaluate((allNutritionRowsxpath) => {
      // Looking for all Results that have the XPath Above (allNutritionRowsxpath)
      const element = document.evaluate(allNutritionRowsxpath, document, null, XPathResult.ANY_TYPE, null);
      // Iterates through each located Result (There are multple Rows with that same class).
      let thisElement = element.iterateNext();
      // Create an empty array to input all requried nutritional data into
      let allElementsArray = [];
      // Create an empty object to input all of the Array data into once the array has been completed
      let AllElementsObject = {};
      // While the current element (result) is being evaluated, do the following.
      while (thisElement) {
        // Locate all child elements inside of the current element
        /*
          Example of one of the elements:
            <div class="pdp-description-reviews__nutrition-row pdp-description-reviews__nutrition-row--details">
            <div class="pdp-description-reviews__nutrition-cell pdp-description-reviews__nutrition-cell--details">Energy kJ</div>
            <div class="pdp-description-reviews__nutrition-cell pdp-description-reviews__nutrition-cell--details">455</div>
            <div class="pdp-description-reviews__nutrition-cell pdp-description-reviews__nutrition-cell--details">8400</div>
            <div class="pdp-description-reviews__nutrition-cell pdp-description-reviews__nutrition-cell--details"></div>
          </div>
        */
        const childElements = thisElement.querySelectorAll('*'); // Get all child elements
        // Only the second value from each element is required (separated to help break down more)
        const specificChildIndex = 1; // Replace with the index of the specific child element you want to select
        // Specifying the SPECIFIC element required using the index chosen
        const specificChildElement = childElements[specificChildIndex];
        // If a value does exist for the selected index/element
        if (specificChildElement) {
          //add the selected element into the array
          allElementsArray.push(specificChildElement.textContent);
        }
        // Iterate to the next element in the list
        thisElement = element.iterateNext();
      }
      // Once all the elements have been iterated through, Create an Object for all of the data, asigning each value the corresponding nutritional title 
      AllElementsObject = {
        Energy: allElementsArray[0],
        Calories: allElementsArray[1],
        Fat: allElementsArray[2],
        Saturates: allElementsArray[3],
        Carbohydrate: allElementsArray[4],
        Sugars: allElementsArray[5],
        Fibre: allElementsArray[6],
        Protein: allElementsArray[7],
        Salt: allElementsArray[8],
      }
      // Once all Elements have been iterated through, return the array as the result for: allNutritionRowsvalue
      return AllElementsObject;
    }, allNutritionRowsxpath);

    console.log(
      'Product Name:', productName,
      '\n','Price:', pricevalue,
      '\n',
      '\n','Nutritional Table, Per 100(g/ml):',
      '\n',allNutritionRowsvalue,
    );
  } catch (error) {
    console.error('Error occurred:', error);
  } finally {
    await browser.close(); // Close the browser after the operation is complete
  }
})();


//Run Scrape (easier to copy and pase rather than typing every time :) )
//node scrape.js
