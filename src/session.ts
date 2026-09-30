import {BETS, NAMES, initialState, type State} from './engine/game';

export const INITIAL_GRID=[0,1,2,3,7,4,5,0,6,9,3,6,2,8,4];
export const SAVE_KEY='poo-star-v1';
export interface Session {state:State;grid:number[];payout:number;betIndex:number}
const counter=(n:unknown):n is number=>Number.isSafeInteger(n)&&Number(n)>=0;
export function validState(value:unknown):value is State {
 if(!value||typeof value!=='object')return false;
 const s=value as State;
 return counter(s.balance)&&counter(s.round)&&counter(s.bonusWin)&&counter(s.free)&&s.free<=50&&
  Number.isInteger(s.multiplier)&&s.multiplier>=1&&s.multiplier<=10&&BETS.includes(s.bonusBet)&&
  (s.free>0||s.multiplier===1);
}
export function freshSession():Session{return {state:initialState(),grid:[...INITIAL_GRID],payout:0,betIndex:2};}
/** Old saves retain their credits; new saves also restore the settled reel display. */
export function restoreSession(raw:string|null):Session {
 try {
  const value=JSON.parse(raw||'null');
  if(!validState(value))return freshSession();
  const {balance,free,multiplier,bonusBet,round,bonusWin}=value;
  const snapshot=value as State & {grid?:unknown;payout?:unknown;betIndex?:unknown};
  const hasGrid=Array.isArray(snapshot.grid)&&snapshot.grid.length===15&&snapshot.grid.every(s=>Number.isInteger(s)&&s>=0&&s<NAMES.length);
  const grid=hasGrid?snapshot.grid as number[]:[...INITIAL_GRID];
  return {state:{balance,free,multiplier,bonusBet,round,bonusWin},grid,
   payout:hasGrid&&counter(snapshot.payout)?snapshot.payout:0,
   betIndex:Number.isInteger(snapshot.betIndex)&&Number(snapshot.betIndex)>=0&&Number(snapshot.betIndex)<BETS.length?Number(snapshot.betIndex):2};
 }catch{return freshSession();}
}
export function encodeSession(session:Session):string {
 return JSON.stringify({...session.state,grid:session.grid,payout:session.payout,betIndex:session.betIndex});
}
