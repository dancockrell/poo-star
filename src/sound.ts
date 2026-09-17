import musicUrl from '../public/audio/c-funk.mp3?url';
const files=import.meta.glob('../public/audio/fx/*',{eager:true,query:'?url',import:'default'}) as Record<string,string>;
export type Cue='tap'|'roll'|'stop'|'scatter'|'wild'|'win'|'bigwin'|'bonus'|'lose'|'preview';
/** File playback only: licensed music and CC0 recorded foley. */
export class Sound {
 enabled=true;musicLevel=1;effectLevel=1;
 private context?:AudioContext;private music?:GainNode;private fx?:GainNode;private track?:HTMLAudioElement;
 private buffers=new Map<string,AudioBuffer>();private loading?:Promise<void>;private sources=new Set<AudioBufferSourceNode>();
 private release?:ReturnType<typeof setTimeout>;private duckDepth=1;private step=0;private epoch=0;
 private clamp(v:number){return Number.isFinite(v)?Math.max(0,Math.min(1,v)):0;}
 private prepare(){if(this.context)return;const c=this.context=new AudioContext(),limiter=c.createDynamicsCompressor();limiter.threshold.value=-10;limiter.ratio.value=4;limiter.connect(c.destination);this.music=c.createGain();this.fx=c.createGain();this.music.gain.value=this.musicLevel;this.fx.gain.value=this.effectLevel;this.music.connect(limiter);this.fx.connect(limiter);
 this.track=new Audio(musicUrl);this.track.loop=true;this.track.preload='auto';const trim=c.createGain();trim.gain.value=.75;c.createMediaElementSource(this.track).connect(trim);trim.connect(this.music);
 this.loading=Promise.all(Object.entries(files).map(async([path,url])=>{try{const response=await fetch(url);if(!response.ok)throw Error('Audio unavailable');const buffer=await c.decodeAudioData(await response.arrayBuffer());let peak=0,sum=0,n=0;for(let ch=0;ch<buffer.numberOfChannels;ch++)for(const v of buffer.getChannelData(ch)){peak=Math.max(peak,Math.abs(v));sum+=v*v;n++;}const gain=Math.min(.85/Math.max(.001,peak),.11/Math.max(.001,Math.sqrt(sum/n)));for(let ch=0;ch<buffer.numberOfChannels;ch++){const data=buffer.getChannelData(ch);for(let i=0;i<data.length;i++)data[i]*=gain;}this.buffers.set(path.split('/').pop()!,buffer);}catch(e){console.warn('Recorded effect failed to load',path,e);}})).then(()=>{});
 }
 toggle(){this.enabled=!this.enabled;if(this.enabled){this.resume();this.play('tap');}else this.stop();return this.enabled;}
 levels(music:number,effects:number){this.musicLevel=this.clamp(music);this.effectLevel=this.clamp(effects);if(this.context){this.music!.gain.setTargetAtTime(this.musicLevel*this.duckDepth,this.context.currentTime,.05);this.fx!.gain.setTargetAtTime(this.effectLevel,this.context.currentTime,.05);}}
 beginRound(){this.epoch++;for(const source of this.sources){try{source.stop();}catch{}}this.sources.clear();clearTimeout(this.release);this.duckDepth=1;if(this.context)this.music!.gain.setTargetAtTime(this.musicLevel,this.context.currentTime,.08);}

 stop(){this.epoch++;this.track?.pause();clearTimeout(this.release);this.duckDepth=1;for(const s of this.sources){try{s.stop();}catch{}}this.sources.clear();if(this.context){this.music!.gain.cancelScheduledValues(this.context.currentTime);this.music!.gain.value=this.musicLevel;void this.context.suspend();}}
 resume(){if(!this.enabled||document.hidden)return;this.prepare();void this.context!.resume();void this.track!.play().catch(()=>{});}
 private sample(name:string,delay=0,level=1){const buffer=this.buffers.get(name);if(!buffer||this.sources.size>=12)return;const c=this.context!,s=c.createBufferSource(),g=c.createGain();s.buffer=buffer;g.gain.value=level;s.connect(g);g.connect(this.fx!);this.sources.add(s);s.onended=()=>{this.sources.delete(s);s.disconnect();g.disconnect();};s.start(c.currentTime+delay);}
 private duck(){const c=this.context!;clearTimeout(this.release);this.duckDepth=.7;this.music!.gain.setTargetAtTime(this.musicLevel*.7,c.currentTime,.08);this.release=setTimeout(()=>{this.duckDepth=1;this.music!.gain.setTargetAtTime(this.musicLevel,c.currentTime,.35);},950);}
 play(kind:Cue,step=0){if(!this.enabled||document.hidden)return;this.prepare();const epoch=this.epoch,start=performance.now();void this.loading!.then(()=>{if(!this.enabled||document.hidden||epoch!==this.epoch||performance.now()-start>900)return;this.step++;const fart=this.step%2?'fart-445998.mp3':'fart-446000.mp3';
 if(kind==='tap')this.sample('card-place-1.ogg',0,.55);
 if(kind==='roll'){this.sample('card-shuffle.ogg',0,.65);this.sample('dice-shake-1.ogg',.15,.45);}
 if(kind==='stop')this.sample('chip-lay-1.ogg',0,.55+step*.04);
 if(kind==='scatter')this.sample('chips-collide-1.ogg',0,.8);
 if(kind==='preview')this.sample(fart,0,.95);
 if(kind==='wild')this.sample('chips-collide-1.ogg',0,.8);
 if(['win','bigwin','bonus'].includes(kind)){this.duck();this.sample('splat.mp3',1.05);this.sample('chips-handle-1.ogg',.2,.7);if(kind!=='win'){this.sample(fart,.45);this.sample('splat.mp3',1.65);this.sample('chips-collide-1.ogg',1,.7);}}
 });}
}
