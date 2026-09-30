import {expect,it} from 'vitest';
import {encodeSession,freshSession,restoreSession} from '../src/session';
it('restores credits and their matching visible settled result together',()=>{
 const saved=freshSession();saved.state.round=12;saved.state.balance=123450;saved.grid=Array(15).fill(5);saved.payout=450;saved.betIndex=4;
 expect(restoreSession(encodeSession(saved))).toEqual(saved);
});
it('retains valid legacy credits without inventing an old reel result',()=>{
 const saved=freshSession();saved.state.round=7;saved.state.balance=234500;
 expect(restoreSession(JSON.stringify(saved.state))).toEqual(saved);
});
it('recovers safely from invalid JSON, partial saves, and unsafe counters',()=>{
 for(const raw of ['{','null',JSON.stringify({balance:900,free:0,multiplier:1,bonusBet:100}),...['round','balance','bonusWin','free'].map(key=>JSON.stringify({...freshSession().state,[key]:-1}))])expect(restoreSession(raw)).toEqual(freshSession());
 expect(restoreSession(JSON.stringify({...freshSession().state,round:Number.MAX_SAFE_INTEGER+1}))).toEqual(freshSession());
});
it('does not restore malformed display data or a bet outside the supported range',()=>{
 expect(restoreSession(JSON.stringify({...freshSession().state,grid:[99],payout:-2,betIndex:99}))).toEqual(freshSession());
});
