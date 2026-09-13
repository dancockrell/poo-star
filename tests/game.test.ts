import {describe,it,expect} from 'vitest';import {spin,initialState,evaluate,BETS,STRIP} from '../src/engine/game';import {SeededRng} from '../src/engine/rng';
describe('Poo Star demo rules',()=>{
 it('awards fifty free spins for five or more scatter stars',()=>{const r=spin(initialState(),100,{nextInt(max){return max===STRIP.length?STRIP.indexOf(2):1;}});expect(r.awarded).toBe(50);expect(r.state.free).toBe(50);expect(r.state.bonusBet).toBe(100);});
 it('pays matching lines from the left with wild substitution',()=>{const grid=[0,5,0,1,3,1,3,4,6,7,4,6,7,8,9];expect(evaluate(grid,100).some(w=>w.symbol===0&&w.cells.join(',')==='0,1,2')).toBe(true);});
 it('never treats a scatter as a normal line symbol',()=>{expect(evaluate(Array(15).fill(2),100)).toEqual([]);});
 it('preserves the credit ledger through 2000 spins and bonuses',()=>{let s=initialState();s.balance=10000000;const rng=new SeededRng(42);for(let i=0;i<2000;i++){const before=s;const r=spin(s,100,rng);expect(r.grid).toHaveLength(15);expect(r.state.balance).toBe(before.balance-(before.free?0:100)+r.payout);expect(r.state.free).toBeLessThanOrEqual(50);expect(r.state.multiplier).toBeLessThanOrEqual(10);s=r.state;}});
 it('free spins retain the awarded wager and never debit the balance',()=>{const s={...initialState(),free:2,bonusBet:200};const r=spin(s,100,new SeededRng(17));expect(r.bet).toBe(200);expect(r.state.balance).toBe(s.balance+r.payout);});
 it('rejects unsupported and unaffordable bets',()=>{expect(()=>spin(initialState(),123,new SeededRng(1))).toThrow();expect(()=>spin({...initialState(),balance:0},BETS[0],new SeededRng(1))).toThrow();});
});

it('pays wild runs even when followed by a scatter',()=>{const grid=Array(15).fill(2);grid[0]=5;grid[1]=5;grid[2]=5;const wins=evaluate(grid,100);expect(wins.find(w=>w.cells.join(',')==='0,1,2')?.amount).toBe(280);});
it('scales rewards consistently across every allowed wager',()=>{const grid=[0,0,0,1,3,1,3,4,6,7,4,6,7,8,9];for(const bet of BETS)expect(evaluate(grid,bet).reduce((n,w)=>n+w.amount,0)/bet).toBe(evaluate(grid,100).reduce((n,w)=>n+w.amount,0)/100);});
