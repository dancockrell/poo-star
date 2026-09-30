import {chromium} from '@playwright/test';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 const url=process.env.DEMO_URL||'http://127.0.0.1:8792/';
 const origin=new URL(url).origin,external=[],failures=[];
 const page=await browser.newPage();
 await page.route('**/*',route=>{const request=route.request().url();if(/^https?:/.test(request)&&new URL(request).origin!==origin){external.push(request);return route.abort();}return route.continue();});
 page.on('response',r=>{if(r.status()>=400)failures.push(`${r.status()} ${r.url()}`);});
 await page.goto(url,{waitUntil:'networkidle'});
 const fonts=await page.evaluate(async()=>{
  const faces=[...[400,500,600,700,800,900].map(w=>`${w} 16px "Barlow Condensed"`),'400 16px "Permanent Marker"'];
  const loaded=await Promise.all(faces.map(f=>document.fonts.load(f)));return loaded.map(f=>f.length>0&&f.every(face=>face.status==='loaded'));
 });
 assert.equal(fonts.length,7);assert.ok(fonts.every(Boolean));assert.deepEqual(external,[]);assert.deepEqual(failures,[]);
 for(const path of ['licenses/fonts/BarlowCondensed-OFL.txt','licenses/fonts/PermanentMarker-LICENSE.txt','build.json'])assert.equal((await page.request.get(new URL(path,url).href)).status(),200);
 console.log(JSON.stringify({passed:true,fonts:fonts.length,externalRequests:external,failedRequests:failures}));
}finally{await browser.close();}
