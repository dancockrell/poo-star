import './style.css';
import {BETS,NAMES,browserRng,initialState,spin,type State,type Result} from './engine/game';
import {Sound} from './sound';
const initialGrid=[0,1,2,3,7,4,5,0,6,9,3,6,2,8,4];
let state=initialState(),betIndex=2,busy=false,auto=false,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
try{const saved=JSON.parse(localStorage.getItem('poo-star-v1')||'null');if(saved&&Number.isSafeInteger(saved.balance)&&saved.balance>=0&&Number.isInteger(saved.free)&&saved.free>=0&&saved.free<=50&&Number.isInteger(saved.multiplier)&&saved.multiplier>=1&&saved.multiplier<=10&&BETS.includes(saved.bonusBet))state=saved;}catch{}
let autoEpoch=0;
const sound=new Sound();const money=(value:number)=>`€${(value/100).toLocaleString('en-IE',{minimumFractionDigits:2,maximumFractionDigits:2})}`;
const app=document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML=`<div class="topline"><span>THE NUMBER TWO EXPERIENCE</span><div><button id="sound" aria-label="Enable sound" aria-pressed="false">♫ SOUND OFF</button><details class="quick-mixer"><summary>MIX</summary><div><label>MUSIC <input id="quick-music" aria-label="Quick music volume" type="range" min="0" max="100"></label><label>SOUND EFFECTS <input id="quick-effects" aria-label="Quick effects volume" type="range" min="0" max="100"></label><button id="test-fart">TEST FART</button></div></details><button id="help">HOW TO PLAY</button></div></div>
<section class="stage" aria-label="Poo Star slot demo"><h1 class="sr-only">Poo Star — Not the usual shitty slot</h1>
<div id="reels" class="reels" role="group" aria-label="Five reels, three rows"></div>
<aside class="feature-board"><h2>FEATURES</h2><div class="chalk-feature"><i aria-hidden="true">&#9832;</i><strong>UP TO 50</strong><span>FIBRE FREE SPINS</span></div><div class="chalk-feature"><i aria-hidden="true">&times;</i><strong>MULTIPLIER</strong><span>BUILDS SHIT</span></div><div class="chalk-feature"><i aria-hidden="true">?!</i><strong>RANDOM</strong><span>POO EVENTS</span></div><small>IT ALL ADDS UP TO A<br><strong>BIGGER PRIZE DUMP!</strong></small></aside>
<div id="bonus" class="bonus-strip" hidden><span>FIBRE FREE SPINS</span><strong id="free">0</strong><span id="multiplier">×1</span></div>
<div id="message" class="sr-only" role="status" aria-live="polite">TURDS. FAME. FORTUNE.</div>
<div class="controls"><button class="square menu" id="menu" aria-label="Open game menu">≡</button><div class="meter balance"><small>BALANCE</small><strong id="balance"></strong></div><div class="bet-box"><button id="minus" aria-label="Decrease bet">−</button><div class="meter"><small>BET</small><strong id="bet"></strong></div><button id="plus" aria-label="Increase bet">+</button></div><button id="spin" class="spin">SPIN <span class="crown">♛</span></button><button class="square max" id="max">MAX<br>BET</button><button class="square auto" id="auto" aria-pressed="false">AUTO<br>PLAY</button></div>
<div class="win-readout">LAST WIN <strong id="win">€0.00</strong></div>
<div id="poo-burst" class="poo-burst" aria-hidden="true"></div><div class="celebration" id="celebration" hidden aria-live="polite"><span id="win-title">GOOD SHIT!</span><strong id="win-amount">€0.00</strong><small id="win-caption">THAT'S SHOW BUSINESS.</small></div>
</section><footer><span>DEMO PLAY · NO CASH VALUE</span><span id="round">ROUND 0000</span></footer>
<dialog id="dialog"><button id="close" class="close" aria-label="Close dialog">×</button><div id="dialog-body"></div></dialog>`;
const el=<T extends HTMLElement=HTMLElement>(id:string)=>document.getElementById(id) as T;
function tile(id:number,index:number){return `<div class="cell ${id===2?'scatter':id===5?'wild':''}" data-index="${index}" aria-label="${NAMES[id]}"><div class="symbol" style="--x:${id%4/3*100}%;--y:${Math.floor(id/4)/2*100}%"></div>${id===2?'<b class="symbol-label">SCATTER</b>':id===5?'<b class="symbol-label">WILD</b>':''}</div>`;}
function draw(grid:number[]){el('reels').innerHTML=grid.map(tile).join('');}
async function rollReels(result:Result){
 const old=[...el('reels').querySelectorAll<HTMLElement>('.cell')];
 const height=el('reels').clientHeight/3;
 const columns=Array.from({length:5},(_,col)=>{
  const reel=document.createElement('div');reel.className='reel-window';
  const strip=document.createElement('div');strip.className='reel-strip';
  // Decorative symbols never touch the already determined game outcome.
  const lead=18+col*3;
  strip.innerHTML=Array.from({length:lead+3},(_,i)=>i<3?old[i*5+col].outerHTML:tile((i*7+col*3+state.round)%12,-1)).join('')+Array.from({length:3},(_,row)=>tile(result.grid[row*5+col],row*5+col)).join('')+tile((col+state.round)%12,-1);
  strip.querySelectorAll<HTMLElement>('.cell').forEach(c=>c.style.height=`${height}px`);
  reel.append(strip);return {reel,strip,distance:(lead+3)*height,col};
 });
 el('reels').replaceChildren(...columns.map(c=>c.reel));
 await Promise.all(columns.map(async({strip,distance,col})=>{
  const overshoot=height*.18;
  const animation=strip.animate([
   {transform:'translateY(0)',offset:0,easing:'ease-in'},
   {transform:`translateY(${-distance*.04}px)`,offset:.1},
   {transform:`translateY(${-distance*.88}px)`,offset:.65,easing:'ease-out'},
   {transform:`translateY(${-distance-overshoot}px)`,offset:.82,easing:'ease-in-out'},
   {transform:`translateY(${-distance+overshoot*.48}px)`,offset:.89,easing:'ease-in-out'},
   {transform:`translateY(${-distance-overshoot*.2}px)`,offset:.95,easing:'ease-out'},
   {transform:`translateY(${-distance}px)`,offset:1}
  ],{duration:1500+col*230,easing:'linear',fill:'forwards'});
  await animation.finished;sound.play('stop',col);if(result.grid.some((id,i)=>i%5===col&&id===2))sound.play('scatter');
 }));
 draw(result.grid);
}
function refresh(){el('balance').textContent=money(state.balance);el('bet').textContent=money(state.free?state.bonusBet:BETS[betIndex]);el('round').textContent=`ROUND ${String(state.round).padStart(4,'0')}`;el('bonus').hidden=!state.free;el('free').textContent=String(state.free);el('multiplier').textContent=`×${state.multiplier}`;
 for(const id of ['minus','plus','max'])el<HTMLButtonElement>(id).disabled=busy||state.free>0;
 el<HTMLButtonElement>('spin').disabled=busy;el('spin').innerHTML=busy?'ROLLING…':state.free?'FREE SPIN <span class="crown">♛</span>':'SPIN <span class="crown">♛</span>';
 el('auto').classList.toggle('selected',auto);el('auto').setAttribute('aria-pressed',String(auto));}
function save(){try{localStorage.setItem('poo-star-v1',JSON.stringify(state));}catch{}}
const delay=(ms:number)=>new Promise(r=>setTimeout(r,ms));
let celebrationTimer:ReturnType<typeof setTimeout>;
let burstTimer:ReturnType<typeof setTimeout>;
function pooBurst(result:Result){
 clearTimeout(burstTimer);const layer=el('poo-burst');layer.replaceChildren();
 if(!result.payout&&!result.awarded)return;
 const big=result.payout>=result.bet*5||result.awarded>0;
 const positions=big?[[16,10],[72,13],[45,70]]:[[45,65]];
 layer.innerHTML=positions.map(([x,y],i)=>`<span class="poo-flight" style="--x:${x}%;--y:${y}%;--delay:${reduced?0:i*.3}s;--turn:${i%2?18:-18}deg"><span class="poo-piece">&#128169;</span><span class="poo-splat"></span><b class="splat-word">SPLAT!</b></span>`).join('');
 burstTimer=setTimeout(()=>layer.replaceChildren(),reduced?1500:4800);
}
function celebrate(result:Result){pooBurst(result);clearTimeout(celebrationTimer);if(!result.awarded&&!result.event&&!result.payout)return;
 el('win-title').textContent=result.awarded?'FIBRE POWER!':result.event&&result.payout<result.bet*5?result.event:result.payout>=result.bet*20?'HOLY SHIT!':'GOOD SHIT!';
 el('win-amount').textContent=result.awarded?`${result.awarded} FREE SPINS`:result.payout?money(result.payout):'WILD ARRIVAL';
 el('win-caption').textContent=result.awarded?'KEEP THINGS MOVING.':"YOU'RE A REAL SHIT LEGEND.";el('celebration').hidden=false;celebrationTimer=setTimeout(()=>el('celebration').hidden=true,reduced?1500:4800);}
async function play(){if(busy)return;busy=true;clearTimeout(burstTimer);el('poo-burst').replaceChildren();el('celebration').hidden=true;refresh();sound.play('roll');el('message').textContent='YOUR MOMENT IN THE SPOTLIGHT…';
 try{const result=spin(state,BETS[betIndex],browserRng);state=result.state;save();
 if(!reduced)await rollReels(result);else draw(result.grid);
 result.wins.flatMap(w=>w.cells).forEach(index=>document.querySelector(`[data-index="${index}"]`)?.classList.add('winner'));
 el('win').textContent=money(result.payout);el('message').textContent=result.awarded?`${result.awarded} FIBRE FREE SPINS · LET THE GOOD TIMES ROLL`:result.payout?`${money(result.payout)} · ${result.wins.length} WINNING ${result.wins.length===1?'LINE':'LINES'}${result.free?' · FIBRE POWER':''}`:result.event||['EVERY TURD HAS ITS DAY.','DREAM BIGGER. AIM LOWER.','FAME IS JUST A FLUSH AWAY.','YOUR NEXT BIG MOVEMENT AWAITS.'][state.round%4];
 if(result.awarded)sound.play('bonus');else if(result.payout)sound.play(result.payout>=result.bet*5?'bigwin':'win');else if(result.event)sound.play('wild');else if(state.round%3===0)sound.play('lose');celebrate(result);
 }catch(e){el('message').textContent=(e as Error).message;auto=false;}finally{busy=false;refresh();}
 if(auto){const epoch=autoEpoch;await delay(reduced?1500:4800);if(auto&&epoch===autoEpoch&&!busy)void play();}}
el('spin').onclick=()=>{autoEpoch++;auto=false;void play();};el('auto').onclick=()=>{autoEpoch++;auto=!auto;refresh();if(auto&&!busy)void play();};
el('minus').onclick=()=>{betIndex=Math.max(0,betIndex-1);sound.play('tap');refresh();};el('plus').onclick=()=>{betIndex=Math.min(BETS.length-1,betIndex+1);sound.play('tap');refresh();};el('max').onclick=()=>{betIndex=BETS.length-1;sound.play('tap');refresh();};
el('sound').onclick=()=>{const enabled=sound.toggle();el('sound').textContent=enabled?'♫ SOUND ON':'♫ SOUND OFF';el('sound').setAttribute('aria-pressed',String(enabled));el('sound').setAttribute('aria-label',enabled?'Mute sound':'Enable sound');};
function syncMixer(){el<HTMLInputElement>('quick-music').value=String(Math.round(sound.musicLevel*100));el<HTMLInputElement>('quick-effects').value=String(Math.round(sound.effectLevel*100));}
for(const id of ['quick-music','quick-effects'])el<HTMLInputElement>(id).oninput=()=>sound.levels(Number(el<HTMLInputElement>('quick-music').value)/100,Number(el<HTMLInputElement>('quick-effects').value)/100);
el('test-fart').onclick=()=>{if(!sound.enabled)el('sound').click();sound.play('lose');};syncMixer();
const dialog=el<HTMLDialogElement>('dialog');function showMenu(){autoEpoch++;auto=false;refresh();el('dialog-body').innerHTML=`<p class="eyebrow">WELCOME TO THE NUMBER TWO CLUB</p><h2>HOW TO POO STAR</h2><p>Spin five reels. Match three or more symbols from the left on any of <strong>20 fixed paylines</strong>. The golden sunglasses star is wild and stands in for any symbol except Scatter.</p><div class="rules"><div><b>STAR POWER</b><p>3 Scatters award 10 free spins; 4 award 20; 5 or more award 50. Free spins can retrigger, up to 50 remaining.</p></div><div><b>FIBRE POWER</b><p>A winning free spin increases the next spin's multiplier, up to ×10. Your bet stays locked during free spins.</p></div><div><b>A STAR IS BORN</b><p>Occasionally a random symbol turns golden wild. No extra bet required.</p></div></div><h3>THE PAYOUTS</h3><p>Each of 20 lines receives 1/20 of your bet. Letters and toilet roll pay 28 / 84 / 280 times the line bet for 3 / 4 / 5 matches. Premium symbols pay 56 / 196 / 840 times. Scatters additionally pay 2 / 5 / 20 times your total bet for 3 / 4 / 5+.</p><div class="audio-settings"><label>MUSIC <input id="music-level" type="range" min="0" max="100" value="${Math.round(sound.musicLevel*100)}" aria-label="Music volume"></label><label>EFFECTS <input id="effects-level" type="range" min="0" max="100" value="${Math.round(sound.effectLevel*100)}" aria-label="Effects volume"></label><p class="fine">Music: <a href="https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1100001" target="_blank" rel="noopener">�C-Funk� � Kevin MacLeod (incompetech.com)</a>, licensed under <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC BY 4.0</a>. Looped with gameplay volume ducking. Recorded effects by Breviceps (Freesound) and Kenney, CC0. Enable sound using the button above the game.</p></div><label class="setting"><input type="checkbox" id="reduced" ${reduced?'checked':''}> Reduced motion</label><button class="refill" id="refill" ${busy?'disabled':''}>REFILL DEMO CREDITS</button><p class="fine">A gag game made with love. Fictional credits, no deposits, no cash prizes. Game progress is saved only in this browser. This demo has no certified return percentage.</p>`;dialog.showModal();for(const id of ['music-level','effects-level'])el<HTMLInputElement>(id).oninput=()=>{sound.levels(Number(el<HTMLInputElement>('music-level').value)/100,Number(el<HTMLInputElement>('effects-level').value)/100);syncMixer();};el<HTMLInputElement>('reduced').onchange=e=>{reduced=(e.target as HTMLInputElement).checked;document.documentElement.classList.toggle('reduced',reduced);};el('refill').onclick=()=>{state=initialState();save();draw(initialGrid);el('win').textContent='€0.00';refresh();dialog.close();};}
el('menu').onclick=showMenu;el('help').onclick=showMenu;el('close').onclick=()=>dialog.close();dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){autoEpoch++;auto=false;sound.stop();refresh();}else sound.resume();});document.addEventListener('keydown',e=>{if(e.code==='Space'&&!dialog.open&&e.target===document.body){e.preventDefault();autoEpoch++;auto=false;void play();}});
document.documentElement.classList.toggle('reduced',reduced);draw(initialGrid);refresh();

// Project the sign into its painted trapezoid; right edge is shorter than left.
const chalk=document.querySelector<HTMLElement>('.feature-board')!;
new ResizeObserver(()=>{const w=chalk.clientWidth,h=chalk.clientHeight;if(!w)return;const g=1/.86-1;chalk.style.transform=`matrix3d(${1+g},${.07*(1+g)*h/w},0,${g/w},0,1,0,0,0,0,1,0,0,0,0,1)`;}).observe(chalk);
