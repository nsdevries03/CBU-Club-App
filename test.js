const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    try {
        // Open window
        const browser = await puppeteer.launch({
            "headless": false
        });
        const page = await browser.newPage();

        await page.goto("https://calbaptist.edu/life-at-cbu/community-life/clubs-and-organizations");
        await page.waitForSelector('.page-main-content');
        const content = await page.$('.page-main-content');

        // Get data
        let ps = await page.evaluate(el => {
            return Array.from(el.querySelectorAll('p')).map(p => p.textContent);
            }, content);
        const h2s = await page.evaluate(el2 => {
            return Array.from(el2.querySelectorAll('h2')).map(h2 => h2.textContent);
            }, content);

        // Remove forbidden json characters
        for (let i = 0; i < ps.length; i++) {
            ps[i] = ps[i].replace(/'"/g, '');
            ps[i] = ps[i].replace('\n', '');
            ps[i] = ps[i].replace('\t', '');
            ps[i] = ps[i].replace(' ', '');
            ps[i] = ps[i].replace('President - ', '');
            ps[i] = ps[i].replace('Advisor - ', '');
        }

        // Convert text to json string
        let json = "";
        let pCount = 8;
        for (const h2 of h2s) {
            json += "{\n\t\"title\": \"" + h2 + "\", \n";
            json += "\t\"description\": \"" + ps[pCount] + "\", \n";
            json += "\t\"president\": \"" + ps[pCount + 1] + "\", \n";
            json += "\t\"advisor\": \"" + ps[pCount + 2] + "\"\n}, \n";
            pCount += 3;
        }
        json = json.slice(0, -3);

        // Save string to .json file
        fs.writeFile("output.json", json, (err) => {
            if (err) {
                console.error("Error writing file: ", err);
            } else {
                console.log("JSON file has been saved.");
            }
        });

        await browser.close();
    } catch (e) {
        console.log('error', e);
    }
})();