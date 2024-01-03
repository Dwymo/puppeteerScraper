# puppeteerScraper
 Website Scraper Using Puppeteer

Some random stuff I come across during investigation:

Nutritional Values:
When navigating food items on Asda Website,
XPath for the Nutrition information Panel appears to be different depending on Product, For example:
The product pages for 'Asda Baking Potatoes' and 'Warburtons English muffins' are slightly different (some products have more changes than others).
This causes the xpath for the nutritional tables to be different.

Asda-british-fluffy-golden-large-baking-potatoes
https://groceries.asda.com/product/baking-jacket-potatoes/asda-british-fluffy-golden-large-baking-potatoes/24932
*[@id="main-content"]/main/div[3]/div[2]/div[3]/div/div/div[2]/div[1]/div[2]/div/div[3]/div[2]

Warburtons-english-breakfast-muffins
https://groceries.asda.com/product/muffins-potato-cakes/warburtons-english-breakfast-muffins/910000203040
*[@id="main-content"]/main/div[3]/div[2]/div[3]/div/div/div[2]/div[4]/div[2]/div/div[3]/div[2]

Notice, at the Location: "*[@id="main-content"]/main/div[3]/div[2]/div[3]/div/div/div[2]/div[1]" that 'div[1]' on Potatoes is 'div[4]' on muffins.

Each nutritional table does hower appear to have the following XPath (when using the specific class name):
//div[@class="pdp-description-reviews__nutrition-row pdp-description-reviews__nutrition-row--details"]
This has been tesetd on multiple items which appears to work so can be used to locate all of the Nutritional Data for each product.

The tables themselves also have slight changes for example:
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
