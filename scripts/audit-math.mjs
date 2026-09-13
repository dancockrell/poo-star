// Deterministic complete-cycle audit. Every paid spin includes all resulting free spins.
import fs from 'node:fs';
import ts from 'typescript';
import Module from 'node:module';
const module = new Module('math-audit');
module._compile(ts.transpileModule(fs.readFileSync('src/engine/game.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,'math-audit');
const {spin,initialState,evaluate}=module.exports;
if(!evaluate([5,5,5,2,2,...Array(10).fill(2)],100).some(w=>w.amount===280))throw new Error('Audit compilation or wild rule mismatch');
const cycles=Number(process.env.CYCLES||1000000);
const reports=[];
for(const bet of [20,100,1000]){
 let seed=982451653;
 const rng={nextInt(max){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return Math.floor(seed/4294967296*max);}};
 let state=initialState(),total=0,squares=0,hits=0,free=0,bonuses=0;
 for(let i=0;i<cycles;i++){
  state.balance=1e12;let result=spin(state,bet,rng),cycle=result.payout/bet;
  hits+=Number(result.payout>0);bonuses+=Number(result.awarded>0);state=result.state;
  while(state.free){result=spin(state,bet,rng);cycle+=result.payout/bet;state=result.state;free++;}
  total+=cycle;squares+=cycle*cycle;
 }
 const mean=total/cycles,se=Math.sqrt((squares-cycles*mean*mean)/(cycles-1)/cycles);
 reports.push({betCents:bet,paidCycles:cycles,returnRatio:mean,approx95PercentInterval:[mean-1.96*se,mean+1.96*se],paidHitRate:hits/cycles,bonusRate:bonuses/cycles,freeSpins:free});
}
const report={note:'Seeded Monte Carlo of fictional-credit rules, including complete bonus rounds. Not a certified RTP or guarantee. Intervals are approximate.',reports};
fs.writeFileSync('docs/math-audit.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));

