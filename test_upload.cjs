const puppeteer = require('puppeteer');

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('B-CONSOLE:', msg.text()));
  page.on('pageerror', err => console.error('B-PAGEERROR:', err.toString()));
  page.on('error', err => console.error('B-ERROR:', err.toString()));
  
  await page.goto('http://localhost:5173/customize/frame/1');
  await wait(2000);
  
  console.log("Current URL:", page.url());
  
  // click add to cart
  const buttons = await page.$$('button');
  for (const b of buttons) {
      const text = await page.evaluate(el => el.textContent, b);
      if (text.includes('Checkout')) {
          console.log("Found checkout button, clicking...");
          await b.click();
          break;
      }
  }

  await wait(2000);
  console.log("URL after click:", page.url());

  await browser.close();
})();
