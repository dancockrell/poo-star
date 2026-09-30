import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true});
const url=process.env.DEMO_URL||'http://127.0.0.1:8791/';
const errors=[];
try {
 const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.goto(url,{waitUntil:'domcontentloaded'});
 await page.locator('#plus').click();
 await page.locator('#spin').click();
 await page.waitForFunction(()=>!document.querySelector('#spin').disabled);
 const snapshot=()=>page.evaluate(()=>({balance:document.querySelector('#balance').textContent,bet:document.querySelector('#bet').textContent,win:document.querySelector('#win').textContent,round:document.querySelector('#round').textContent,grid:[...document.querySelectorAll('.cell')].map(e=>e.getAttribute('aria-label'))}));
 const settled=await snapshot();await page.reload({waitUntil:'domcontentloaded'});assert.deepEqual(await snapshot(),settled);
 for(const id of ['preview-win','preview-bigwin','preview-bonus']){
  const before=await page.evaluate(()=>localStorage.getItem('poo-star-v1'));
  await page.locator('#help').click();await page.locator(`#${id}`).click();
  assert.equal(await page.locator('#celebration').isVisible(),true);
  assert.match(await page.locator('#win-caption').innerText(),/SHOWCASE/);
  assert.equal(await page.evaluate(()=>localStorage.getItem('poo-star-v1')),before);
 }
 await page.evaluate(()=>localStorage.setItem('poo-star-v1',JSON.stringify({balance:0,free:0,multiplier:1,bonusBet:100,round:2,bonusWin:0})));
 await page.reload({waitUntil:'domcontentloaded'});await page.locator('#spin').click();
 assert.match(await page.locator('#play-error').innerText(),/Not enough demo credits/);
 await page.locator('#help').click();await page.locator('#refill').click();assert.equal(await page.locator('#play-error').isVisible(),false);
 await page.locator('#spin').click();await page.waitForFunction(()=>!document.querySelector('#spin').disabled);
 await page.evaluate(()=>localStorage.setItem('poo-star-v1','{"balance":12}'));
 await page.reload({waitUntil:'domcontentloaded'});assert.equal(await page.locator('#round').innerText(),'ROUND 0000');
 const blocked=await browser.newPage();blocked.on('pageerror',e=>errors.push(e.message));
 await blocked.addInitScript(()=>{Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Storage unavailable','SecurityError');}});});
 await blocked.goto(url,{waitUntil:'domcontentloaded'});await blocked.locator('#spin').click();await blocked.waitForFunction(()=>!document.querySelector('#spin').disabled);
 assert.equal(await blocked.locator('#round').innerText(),'ROUND 0001');
 // Cancelling presentation must never undo a settled round or leave rolling strips behind.
 await page.locator('#spin').click();await page.evaluate(()=>document.querySelectorAll('.reel-strip').forEach(e=>e.getAnimations().forEach(a=>a.cancel())));
 await page.waitForFunction(()=>!document.querySelector('#spin').disabled);assert.equal(await page.locator('.cell').count(),15);
 assert.deepEqual(errors,[]);
 console.log(JSON.stringify({passed:true,checks:['matching result after reload','showcase leaves ledger unchanged','depleted-credit recovery','malformed save recovery','storage-denied play','cancelled reel presentation'],errors}));
}finally{await browser.close();}
