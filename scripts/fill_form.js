const puppeteer = require('puppeteer');
const fs = require('fs');
const csv = require('csv-parser');

const FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSdoGbHqtJAjAQThWy038XeJTEK5Qo7j__YsZJTvjNcYw4YIiQ/viewform?usp=dialog';

async function readCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

async function fillForm() {
  console.log('Reading CSV data...');
  const formResponses = await readCSV('scripts/form_responses.csv');

  const browser = await puppeteer.launch({ headless: false }); // show UI
  const page = await browser.newPage();

  // Fill from start up to 55 rows
  const limit = Math.min(55, formResponses.length);
  console.log(`Starting to fill form for ${limit} users with a 69-second delay between them...`);

  for (let i = 0; i < limit; i++) {
    const formData = formResponses[i];
    console.log(`\n[${i + 1}/${limit}] Filling form for Record: ${formData.Name}`);

    // The keys in CSV
    // Name,Email,Wallet,TX Link,Feedback/Comment,Rate our product,What improvement you want in our product?
    const finalData = {
      name: formData.Name,
      email: formData.Email,
      wallet: Object.values(formData)[2], // 3rd column
      txLink: Object.values(formData)[3], // 4th column
      feedback: formData['Feedback/Comment'] || Object.values(formData)[4],
      rating: formData['Rate our product'] || Object.values(formData)[5],
      improvement:
        formData['What improvement you want in our product?'] || Object.values(formData)[6],
    };

    try {
      await page.goto(FORM_URL, { waitUntil: 'networkidle2' });
      await page.waitForSelector('input[type="text"]');

      const textInputs = await page.$$('input[type="text"]');
      const textAreas = await page.$$('textarea');
      const radios = await page.$$('div[role="radio"]');

      if (textInputs.length >= 4) {
        await textInputs[0].type(finalData.name || '');
        await textInputs[1].type(finalData.email || '');
        await textInputs[2].type(finalData.wallet || '');
        await textInputs[3].type(finalData.txLink || '');
      }

      if (textAreas.length >= 2) {
        await textAreas[0].type(finalData.feedback || '');
        await textAreas[1].type(finalData.improvement || '');
      }

      if (finalData.rating) {
        let ratingClicked = false;
        for (const radio of radios) {
          const dataValue = await page.evaluate((el) => el.getAttribute('data-value'), radio);
          if (dataValue === finalData.rating) {
            await radio.click();
            ratingClicked = true;
            break;
          }
        }
      }

      // Submit
      const buttons = await page.$$('div[role="button"]');
      for (const btn of buttons) {
        const text = await page.evaluate((el) => el.innerText, btn);
        if (text && text.includes('Submit')) {
          await btn.click();
          break;
        }
      }

      // Wait for confirmation page
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
      console.log(`✅ Successfully submitted record ${i + 1}`);
    } catch (e) {
      console.error(`❌ Error filling form for record ${i + 1}:`, e);
    }

    if (i < limit - 1) {
      console.log(`Waiting 69 seconds before the next submission...`);
      await new Promise((r) => setTimeout(r, 69000));
    }
  }

  await browser.close();
  console.log('\n✅ Finished submitting forms for 55 users!');
}

fillForm().catch(console.error);
