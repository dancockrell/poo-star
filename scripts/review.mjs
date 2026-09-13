import {chromium} from '@playwright/test';
const browser=await chromium.launch({channel:'chrome',headless:true});
try{const page=await browser.newPage({viewport:{width:1440,height:1030}});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(process.env.DEMO_URL||'http://127.0.0.1:8791/');await page.evaluate(()=>document.fonts.ready);await page.locator('#spin').waitFor();
await page.screenshot({path:'docs/desktop.png'});
await page.locator('#spin').click();await page.waitForFunction(()=>JSON.parse(localStorage.getItem('poo-star-v1')||'null')?.round===1);await page.waitForFunction(()=>!document.querySelector('#spin').disabled);
await page.reload();await page.waitForFunction(()=>document.querySelector('#round').textContent==='ROUND 0001');
await page.locator('#help').click();await page.locator('#dialog').waitFor({state:'visible'});await page.locator('#close').click();
await page.locator('#auto').click();await page.waitForFunction(()=>JSON.parse(localStorage.getItem('poo-star-v1')).round>=2);await page.locator('#auto').click();await page.waitForFunction(()=>!document.querySelector('#spin').disabled);const stopped=await page.locator('#round').textContent();await page.waitForTimeout(2200);if(stopped!==await page.locator('#round').textContent())throw new Error('Autoplay did not stop');
await page.setViewportSize({width:390,height:844});await page.screenshot({path:'docs/mobile.png'});const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);if(overflow)throw new Error('Mobile overflow');
await page.locator('#help').click();await page.locator('#refill').click();await page.waitForFunction(()=>document.querySelector('#round').textContent==='ROUND 0000');
if(errors.length)throw new Error(errors.join('\n'));console.log(JSON.stringify({passed:true,errors,checks:['spin','saved round','help','autoplay stop','mobile overflow','refill']}));
}finally{await browser.close();}
