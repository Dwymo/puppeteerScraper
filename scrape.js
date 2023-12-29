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
    /* 
      XPath for the Nutrition information Panel appears to be different depending on Product, For example:
      The product pages for 'Asda Baking Potatoes' and 'Warburtons English muffins' are slightly different (some products have more changes than others).
      This causes the xpath for the nutritional tables to be different.

      Asda-british-fluffy-golden-large-baking-potatoes
      https://groceries.asda.com/product/baking-jacket-potatoes/asda-british-fluffy-golden-large-baking-potatoes/24932
      *[@id="main-content"]/main/div[3]/div[2]/div[3]/div/div/div[2]/div[1]/div[2]/div/div[3]/div[2]

      Warburtons-english-breakfast-muffins
      https://groceries.asda.com/product/muffins-potato-cakes/warburtons-english-breakfast-muffins/910000203040
      *[@id="main-content"]/main/div[3]/div[2]/div[3]/div/div/div[2]/div[4]/div[2]/div/div[3]/div[2]

      Notice that 'div[1]' on Potatoes is 'div[4]' on muffins.

      Each nutritional table does hower appear to have the following XPath (when using the specific class name):
      //div[@class="pdp-description-reviews__nutrition-row pdp-description-reviews__nutrition-row--details"]
      This has been tesetd on multiple items which appears to work so can be used to locate all of the Nutritional Data for each product.

      The tables themselves also have slight changesm for example:
      Asda Baking Potatoes say '(baked, flesh and skin) Per 100g' and the calories are just the number.
      Warburtons English muffins say 'Per 100g of product and the calories have 'kcal' after the number.

      Due to this, it might be benefitial to not take this information and instead, create a universal 100g/100ml per product as the base line.
      Each table does however appear to have the same structure at least with each nutrional value being in the same order:

      Energy
      Calories
      Fat
      of with saturates
      Carbohydrate
      of which sugars
      Fibre
      Protein
      Salt

      Adding each value into an array and creating an object using the above structure should be accurate without the need to create an advanced way to match each value with the appropriate name
    */

      // Xpath using the class that seams to be universal for each nutritional row
    const allNutritionRowsxpath = '//div[@class="pdp-description-reviews__nutrition-row pdp-description-reviews__nutrition-row--details"]';
      // All Required Values
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




    // ORDERED_NODE_ITERATOR_TYPE

    //*[@id="productInformation"]/div[3]/div/div[1]/div[2]/div/div/div/div[1]
    
    /*
    //Product allNutritionRows - Morrisons
    const allNutritionRowsxpath = '//div[@class="bop-nutritionData__origin "]'; 
    const allNutritionRowsvalue = await page.evaluate((allNutritionRowsxpath) => {
      const element = document.evaluate(allNutritionRowsxpath, document, null, XPathResult.ANY_TYPE, null);
      let thisElement = element.iterateNext();
      // let allElements = 'List of All Nutritional Information: \n'
      let allElements = 'List of per 100g Nutritional Information: \n'
      // while (thisElement){
      //   allElements += `${thisElement.textContent}\n`; 
      //   thisElement = element.iterateNext();
      // }

      while (thisElement) {
        const childElements = thisElement.querySelectorAll('*'); // Get all child elements
        // for (const child of childElements) {
        const specificChildIndex = 1; // Replace with the index of the specific child element you want to select
        const specificChildElement = childElements[specificChildIndex];
        if (specificChildElement) {
          allElements += `${specificChildElement.textContent} `;
        }
        //allElements += ` ${child.textContent} ||`; // Add a space after each child element's textContent
        // }
        allElements += '\n'; // Add a newline after each main element
        thisElement = element.iterateNext();
      }
  
      console.log('All Nutritional Table ' + allElements);  
      return allElements;

    }, allNutritionRowsxpath);
    */

    /*
    const tdElements = await page.$$eval('.bop-nutritionData__origin  tbody tr td', tds => {
      let allData = '';
    
      tds.forEach(td => {
        allData += `${td.textContent} `;
      });
    
      console.log(allData.trim());
      return allData.trim();
    });
*/
    //Create an array of All the Nutrional Information from an entered URL:
    function scrapeNutrition(request, response, next) {
      allNutrition = [];
      results.forEach(result => {
        foodItem = {
          id: result.id, // Not going to be shown to user by used in other functions
          name: result.name,
          measurement: result.amount + ' ' + result.measurement,
          calories: result.calories,
          // Will be visible in desktop mode to provide more info on larger screen but removed in mobile
          carbohydrates: result.carbohydrates,
          fat: result.fat,
          protein: result.protein,
          isPrivate: result.isPrivate
        }
        allFood.push(foodItem);
        //console.log(allFood);
      });
      next();
    }



    console.log(
      'Product Name:', productName,
      '\n','Price:', pricevalue,
      '\n',
      '\n','Nutritional Table, Per 100(g/ml):',
      '\n',allNutritionRowsvalue,
      // '\nExtracted Entire Nutritional Table from tdElements: ', tdElements,

    );
  } catch (error) {
    console.error('Error occurred:', error);
  } finally {
    await browser.close(); // Close the browser after the operation is complete
  }
})();


//Run Scrape (easier to copy and pase rather than typing every time :) )
//node scrape.js
