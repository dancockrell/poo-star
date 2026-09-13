import {chromium} from '@playwright/test';
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--autoplay-policy=no-user-gesture-required']});
try{const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.addInitScript(()=>{const Original=window.AudioContext;window.audioProbe=[];window.AudioContext=class extends Original{createDynamicsCompressor(){const node=super.createDynamicsCompressor(),meter=this.createAnalyser();meter.fftSize=2048;node.connect(meter);window.audioProbe.push({context:this,meter});return node;}};});
await page.goto(process.env.DEMO_URL||'http://127.0.0.1:8791/');await page.locator('#sound').click();await page.waitForTimeout(1400);
const measure=()=>page.evaluate(()=>{const p=window.audioProbe[0],data=new Float32Array(p.meter.fftSize);p.meter.getFloatTimeDomainData(data);return {state:p.context.state,rms:Math.sqrt(data.reduce((sum,v)=>sum+v*v,0)/data.length),peak:Math.max(...data.map(Math.abs))};});
const music=await measure();if(music.rms<.001||music.peak>=1)throw new Error('Music silent or clipping '+JSON.stringify(music));
await page.locator('#help').click();await page.locator('#music-level').fill('0');await page.locator('#music-level').dispatchEvent('input');await page.locator('#close').click();await page.waitForTimeout(400);
const musicZero=await measure();if(musicZero.rms>.0001)throw new Error('Music fader zero still audible');
await page.locator('#spin').click();await page.waitForTimeout(150);const fx=await measure();if(fx.rms<.0001)throw new Error('Effects incorrectly muted by music slider');await page.waitForFunction(()=>!document.querySelector('#spin').disabled);
await page.locator('#sound').click();const muted=await measure();if(muted.state!=='suspended')throw new Error('Mute did not suspend audio');
await page.locator('#help').click();await page.locator('#music-level').fill('38');await page.locator('#music-level').dispatchEvent('input');await page.locator('#close').click();await page.locator('#sound').click();await page.waitForTimeout(500);const resumed=await measure();if(resumed.rms<.001)throw new Error('Music did not resume');
if(errors.length)throw new Error(errors.join('\n'));console.log(JSON.stringify({music,musicZero,fx,muted,resumed,errors}));
}finally{await browser.close();}
