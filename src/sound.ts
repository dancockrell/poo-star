export class Sound {
 enabled=false;private context?:AudioContext;private voices=new Set<OscillatorNode>();
 toggle(){this.enabled=!this.enabled;if(this.enabled){this.context??=new AudioContext();void this.context.resume();this.play('tap');}else this.stop();return this.enabled;}
 stop(){for(const v of this.voices){try{v.stop();}catch{}}this.voices.clear();}
 play(kind:'tap'|'roll'|'stop'|'win'|'bonus',step=0){if(!this.enabled)return;const c=this.context!;if(c.state==='suspended')void c.resume();
 const notes=kind==='win'?[261.63,329.63,392,523.25]:kind==='bonus'?[261.63,329.63,392,523.25,659.25,783.99]:[kind==='roll'?90:kind==='stop'?160+step*35:440];
 notes.forEach((freq,i)=>{if(this.voices.size>18)return;const osc=c.createOscillator(),gain=c.createGain();osc.type=kind==='roll'?'triangle':'sine';const t=c.currentTime+i*.095;osc.frequency.setValueAtTime(freq,t);gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(.075,t+.01);gain.gain.exponentialRampToValueAtTime(.001,t+.3);osc.connect(gain);gain.connect(c.destination);osc.start(t);osc.stop(t+.32);this.voices.add(osc);osc.onended=()=>{this.voices.delete(osc);osc.disconnect();gain.disconnect();};});}
}
