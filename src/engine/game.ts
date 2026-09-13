import type {RandomSource} from './types';
export const NAMES=['Toilet roll','Chocolate A','Star scatter','Green K','Blue Q','Golden wild','Pink J','Eau de Poo','Fibre Power','Poo Star','Golden trophy','Crowned star'];
export const LINES=[[0,0,0,0,0],[1,1,1,1,1],[2,2,2,2,2],[0,1,2,1,0],[2,1,0,1,2],[0,0,1,2,2],[2,2,1,0,0],[1,0,0,0,1],[1,2,2,2,1],[0,1,1,1,0],[2,1,1,1,2],[1,0,1,2,1],[1,2,1,0,1],[0,1,0,1,0],[2,1,2,1,2],[0,2,0,2,0],[2,0,2,0,2],[0,2,2,2,0],[2,0,0,0,2],[1,1,0,1,1]];
const weights=[18,16,2,16,16,1,16,9,8,5,4,3];
export const STRIP=weights.flatMap((weight,id)=>Array<number>(weight).fill(id));
export const BETS=[20,50,100,200,500,1000];
export interface State {balance:number;free:number;multiplier:number;bonusBet:number;round:number;bonusWin:number}
export interface Win {cells:number[];amount:number;symbol:number}
export interface Result {grid:number[];wins:Win[];payout:number;bet:number;free:boolean;awarded:number;event:string;state:State}
export function initialState():State{return {balance:998250,free:0,multiplier:1,bonusBet:100,round:0,bonusWin:0};}
export function evaluate(grid:number[],bet:number,multiplier=1):Win[]{
 const wins:Win[]=[];
 for(const line of LINES){
  const cells=line.map((row,col)=>row*5+col);const symbols=cells.map(i=>grid[i]);
  // Pay the best valid interpretation, including wilds before a scatter.
  let best:Win|undefined;
  for(const symbol of [...new Set([5,...symbols.filter(s=>s!==2&&s!==5)])]){
   let count=0;for(const s of symbols){if(s!==symbol&&s!==5)break;count++;}
   if(count<3)continue;
   const pay=(symbol>=7||symbol===5?[56,196,840]:[28,84,280])[count-3];
   const amount=Math.round(bet/20*pay*multiplier);
   if(!best||amount>best.amount)best={cells:cells.slice(0,count),amount,symbol};
  }
  if(best)wins.push(best);
 }
 return wins;
}
export function spin(before:State,requestedBet:number,rng:RandomSource):Result{
 const free=before.free>0,bet=free?before.bonusBet:requestedBet;
 if(!BETS.includes(bet)||!Number.isSafeInteger(before.balance))throw new Error('Choose a valid bet.');
 if(!free&&before.balance<bet)throw new Error('Not enough demo credits. Lower your bet or refill in the menu.');
 const grid=Array.from({length:15},()=>STRIP[rng.nextInt(STRIP.length)]);
 let event='';if(rng.nextInt(24)===0){grid[rng.nextInt(15)]=5;event='A STAR IS BORN';}
 const stars=grid.filter(s=>s===2).length;
 const awarded=stars>=5?50:stars===4?20:stars===3?10:0;
 const multiplier=free?before.multiplier:1;
 const wins=evaluate(grid,bet,multiplier);let payout=wins.reduce((sum,w)=>sum+w.amount,0);
 if(stars>=3)payout+=bet*(stars>=5?20:stars===4?5:2);
 payout=Math.min(payout,bet*10000);
 const remaining=Math.min(50,Math.max(0,before.free-1)+awarded);
 return {grid,wins,payout,bet,free,awarded,event,state:{balance:before.balance-(free?0:bet)+payout,free:remaining,multiplier:remaining?(free&&payout?Math.min(10,multiplier+1):multiplier):1,bonusBet:awarded&&!free?bet:before.bonusBet,round:before.round+1,bonusWin:free?before.bonusWin+payout:awarded?payout:0}};
}
export const browserRng:RandomSource={nextInt(max){const limit=Math.floor(0x100000000/max)*max;const value=new Uint32Array(1);do{crypto.getRandomValues(value);}while(value[0]>=limit);return value[0]%max;}};
