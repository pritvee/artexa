import { chromium } from 'playwright';
import path from 'path';

(async () => {
    console.log("Starting browser...");
    const browser = await chromium.launch({ headless: true });
    // Increase memory limit for page if needed
    const page = await browser.newPage();
    
    // Catch console logs and React errors
    page.on('console', msg => { 
        if (msg.type() === 'error' || msg.type() === 'warning') 
            console.log('PAGE LOG:', msg.text()); 
    });
    page.on('pageerror', err => console.error('PAGE ERROR EXCEPTION:', err.message, err.stack));
    
    try {
        await page.goto('http://localhost:5173/products/1', { waitUntil: 'load' });
        
        console.log("Opening Photo tab...");
        await page.click('text="Photo"');
        
        console.log("Adding butterfly sticker...");
        // Use a wildcard xpath or multiple selectors
        await page.click('img[src*="3067160.png"]', { timeout: 10000 });

        await page.waitForTimeout(1000);
        
        console.log("Clicking Auto enhancement...");
        // Force the click
        await page.click('button:has-text("Auto")', { force: true });
        
        console.log("Waiting for processing...");
        await page.waitForTimeout(5000);
        
        const rootContent = await page.innerHTML('#root');
        if (rootContent.length < 100) {
            console.log("CRASH DETECTED. Root content:", rootContent);
        } else {
            console.log("No crash. Root is preserved.");
        }
        
    } catch (e) {
        console.error("Test failed:", e);
    } finally {
        await browser.close();
    }
})();
