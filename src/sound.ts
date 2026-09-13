import funkoramaUrl from '../public/audio/funkorama.mp3?url';
export type Cue='tap'|'roll'|'stop'|'scatter'|'wild'|'win'|'bigwin'|'bonus'|'lose';

/** Licensed Funkorama recording plus original comic game effects. */
export class Sound {
 enabled=false;musicLevel=.38;effectLevel=.7;
 private context?:AudioContext;private music?:GainNode;private fx?:GainNode;
 private sources=new Set<AudioScheduledSourceNode>();private noise?:AudioBuffer;
 private track?:HTMLAudioElement;
 private timer?:ReturnType<typeof setInterval>;private release?:ReturnType<typeof setTimeout>;
 private step=0;private duckUntil=0;private duckDepth=1;
 constructor(){try{const saved=JSON.parse(localStorage.getItem('poo-star-audio')||'null');if(saved){this.musicLevel=Math.max(0,Math.min(1,saved.music??.38));this.effectLevel=Math.max(0,Math.min(1,saved.effects??.7));}}catch{}}
 private prepare(){if(this.context)return;const c=this.context=new AudioContext();const limiter=c.createDynamicsCompressor();limiter.threshold.value=-14;limiter.knee.value=12;limiter.ratio.value=5;limiter.attack.value=.006;limiter.release.value=.18;limiter.connect(c.destination);
 this.music=c.createGain();this.fx=c.createGain();this.music.gain.value=this.musicLevel;this.fx.gain.value=this.effectLevel;this.music.connect(limiter);this.fx.connect(limiter);
 this.track=new Audio(funkoramaUrl);this.track.loop=true;this.track.preload="auto";c.createMediaElementSource(this.track).connect(this.music);
 this.noise=c.createBuffer(1,c.sampleRate*2,c.sampleRate);const data=this.noise.getChannelData(0);let seed=7341;for(let i=0;i<data.length;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;data[i]=seed/2147483648-1;}}
 toggle(){this.enabled=!this.enabled;if(this.enabled){this.prepare();this.resume();this.play('tap');}else this.stop();return this.enabled;}
 levels(music:number,effects:number){this.musicLevel=Math.max(0,Math.min(1,music));this.effectLevel=Math.max(0,Math.min(1,effects));if(this.context){this.music!.gain.setTargetAtTime(this.musicLevel*this.duckDepth,this.context.currentTime,.03);this.fx!.gain.setTargetAtTime(this.effectLevel,this.context.currentTime,.03);}try{localStorage.setItem('poo-star-audio',JSON.stringify({music:this.musicLevel,effects:this.effectLevel}));}catch{}}
 stop(){this.track?.pause();clearInterval(this.timer);this.timer=undefined;clearTimeout(this.release);this.duckUntil=0;this.duckDepth=1;for(const s of this.sources){try{s.stop();}catch{}}this.sources.clear();if(this.context){this.music!.gain.cancelScheduledValues(this.context.currentTime);this.music!.gain.value=this.musicLevel;void this.context.suspend();}}
 resume(){if(!this.enabled||document.hidden)return;this.prepare();void this.context!.resume();void this.track!.play().catch(()=>{ /* A later user gesture can retry browser-blocked playback. */ });}
 private keep(source:AudioScheduledSourceNode,nodes:AudioNode[]){this.sources.add(source);source.onended=()=>{this.sources.delete(source);source.disconnect();nodes.forEach(n=>n.disconnect());};}
 private note(freq:number,time:number,duration:number,level:number,type:OscillatorType='sine',bus=this.music!,slide?:number){if(this.sources.size>96)return;const c=this.context!,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(freq,time);if(slide)o.frequency.exponentialRampToValueAtTime(slide,time+duration);g.gain.setValueAtTime(.0001,time);g.gain.exponentialRampToValueAtTime(Math.max(.0002,level),time+.009);g.gain.exponentialRampToValueAtTime(.0001,time+duration);o.connect(g);g.connect(bus);o.start(time);o.stop(time+duration+.02);this.keep(o,[g]);}
 private hiss(time:number,duration:number,level:number,frequency:number,bus=this.music!,endFrequency?:number){if(this.sources.size>96)return;const c=this.context!,s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=this.noise!;f.type='bandpass';f.Q.value=.8;f.frequency.setValueAtTime(frequency,time);if(endFrequency)f.frequency.exponentialRampToValueAtTime(endFrequency,time+duration);g.gain.setValueAtTime(.0001,time);g.gain.linearRampToValueAtTime(level,time+.012);g.gain.exponentialRampToValueAtTime(.0001,time+duration);s.connect(f);f.connect(g);g.connect(bus);s.start(time);s.stop(time+duration+.02);this.keep(s,[f,g]);}
 // Resonant envelope gives bass and wah real articulation instead of plain beeps.
 private squelch(f:number,t:number,d:number,level:number,bus:GainNode,rasp=false){
  if(this.sources.size>96)return;
  const c=this.context!,o=c.createOscillator(),filter=c.createBiquadFilter(),g=c.createGain();
  o.type=rasp?'sawtooth':'square';o.frequency.setValueAtTime(f*(rasp?1.5:1.06),t);o.frequency.exponentialRampToValueAtTime(f,t+.035);if(rasp)o.frequency.exponentialRampToValueAtTime(f*.48,t+d);
  filter.type='lowpass';filter.Q.value=rasp?7:4;filter.frequency.setValueAtTime(rasp?1100:1700,t);filter.frequency.exponentialRampToValueAtTime(rasp?170:180,t+d);
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(level,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+d);
  if(rasp)for(let i=1;i<8;i++){const at=t+d*i/9;g.gain.setValueAtTime(level*(i%2?.3:.8)*(1-i/10),at);}
  o.connect(filter);filter.connect(g);g.connect(bus);o.start(t);o.stop(t+d+.025);this.keep(o,[filter,g]);
 }
 private poop(t:number,variant:number){const b=this.fx!;
  if(variant%3===0){this.squelch(92,t,.48,.085,b,true);this.hiss(t,.28,.06,360,b,130);}
  else if(variant%3===1){[0,.13,.31].forEach((offset,i)=>{this.note(420-i*60,t+offset,.16,.15,'sine',b,65);this.hiss(t+offset+.04,.11,.05,800,b,250);});}
  else {this.squelch(150,t,.24,.07,b,true);this.squelch(85,t+.27,.38,.09,b,true);}
 }
 private brass(f:number,t:number,d:number,level:number,bus:GainNode){this.note(f,t,d,level,'sawtooth',bus);this.note(f*1.004,t,d,level*.4,'triangle',bus);this.note(f*2,t,d*.8,level*.14,'sine',bus);}
 private duck(seconds:number,depth:number){const c=this.context!;this.duckDepth=Math.min(this.duckUntil>c.currentTime?this.duckDepth:1,depth);this.duckUntil=Math.max(this.duckUntil,c.currentTime+seconds);clearTimeout(this.release);this.music!.gain.cancelScheduledValues(c.currentTime);this.music!.gain.setTargetAtTime(this.musicLevel*this.duckDepth,c.currentTime,.035);this.release=setTimeout(()=>{this.duckDepth=1;if(this.enabled)this.music!.gain.setTargetAtTime(this.musicLevel,c.currentTime,.3);},(this.duckUntil-c.currentTime)*1000);}
 play(kind:Cue,step=0){if(!this.enabled||document.hidden)return;this.prepare();if(this.context!.state==='suspended')this.resume();const t=this.context!.currentTime+.012,b=this.fx!;this.step++;
 if(kind==='tap'){this.note(730,t,.045,.065,'sine',b);this.hiss(t,.025,.04,2400,b);}
 if(kind==='roll'){this.duck(2.2,.7);this.poop(t,Math.floor(this.step/16));this.note(90,t,.16,.13,'triangle',b,45);this.hiss(t+.07,1.05,.13,420,b,2100);for(let i=0;i<8;i++)this.hiss(t+.1+i*.075,.025,.065,1500+i*140,b);}
 if(kind==='stop'){this.note(460+step*65,t,.075,.09,'triangle',b);this.note(940+step*91,t,.12,.026,'sine',b);this.hiss(t,.04,.06,900,b);}
 if(kind==='scatter'){this.duck(.45,.65);[784,1175,1568].forEach((f,i)=>this.note(f,t+i*.06,.25,.055,'sine',b));}
 if(kind==='wild'){this.duck(1,.4);this.poop(t,2);this.note(110,t,.23,.12,'sawtooth',b,220);[261.63,329.63,392].forEach((f,i)=>this.brass(f,t+.15+i*.1,.23,.05,b));}
 if(kind==='lose'){this.duck(.8,.7);this.poop(t,this.step%3);}
 if(kind==='win'||kind==='bigwin'||kind==='bonus'){
 const big=kind!=='win';this.duck(big?3:1.3,big?.24:.42);
 const notes=kind==='bonus'?[261.63,329.63,392,523.25,659.25,783.99,1046.5]:big?[261.63,392,523.25,659.25,783.99]:[523.25,659.25,783.99,1046.5];
 notes.forEach((f,i)=>{this.brass(f,t+i*.11,big?.42:.19,big?.042:.027,b);this.note(f*2,t+i*.11,.38,.027,'sine',b);});
 for(let i=0;i<(big?12:5);i++)this.note(1800+(i%4)*230,t+.15+i*.07,.1,.019,'sine',b);
 if(big){this.poop(t+.9,1);for(let i=0;i<4;i++)this.hiss(t+.65+i*.22,.2,.07,2200,b);this.note(65.4,t+.65,.6,.14,'triangle',b);}
 }
 }
}
