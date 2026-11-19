import assert from 'node:assert/strict';
import {initial,reduce,agents,tasks,findings,contract,channels,recommendedMessage,status,agentOutput} from '../lib/simulation.ts';
const tick=(s,n)=>{for(let i=0;i<n;i++)s=reduce(s,{type:'TICK'});return s};
assert.equal(agents.length,7);assert.equal(tasks.length,7);assert.ok(findings.every(f=>f.length===contract.length));
const fixtures=JSON.stringify({agents,tasks,findings});
let s=tick(initial(),10);assert.equal(s.stage,0);
s=reduce(s,{type:'START'});assert.equal(s.incidentAt,10);assert.strictEqual(reduce(s,{type:'START'}),s);
s=tick(s,9);assert.equal(s.stage,3);
s=reduce(s,{type:'PAUSE'});assert.strictEqual(tick(s,100),s);assert.strictEqual(reduce(s,{type:'PAUSE'}),s);
s=reduce(s,{type:'RESUME'});assert.strictEqual(reduce(s,{type:'RESUME'}),s);
s=tick(s,22);assert.equal(s.stage,5);
s=tick(s,5);assert.equal(s.stage,6);assert.equal(s.reviewedAt,null);
assert.strictEqual(reduce(s,{type:'APPROVE_UPDATE'}),s);
s=tick(s,5);assert.equal(s.stage,7);assert.ok(s.reviewedAt);assert.equal(s.partnerReadyAt,null);
s=tick(s,4);assert.equal(s.stage,8);assert.equal(s.partnerReadyAt-s.incidentAt,45);
const ready=s; s=tick(s,100);assert.equal(s.stage,8);assert.equal(s.approvedAt,null);
const paused=reduce(s,{type:'PAUSE'});assert.strictEqual(reduce(paused,{type:'APPROVE_UPDATE'}),paused);assert.strictEqual(reduce(paused,{type:'HOLD_UPDATE',reason:'check'}),paused);
for(const action of [{type:'HOLD_UPDATE',reason:' '},{type:'MODIFY_UPDATE',reason:'valid',message:' ',channel:channels[0],updateMinutes:10},{type:'MODIFY_UPDATE',message:'x',channel:'bad',updateMinutes:10,reason:'check'},{type:'MODIFY_UPDATE',message:'x',channel:channels[0],updateMinutes:0,reason:'check'}])assert.strictEqual(reduce(s,action),s);
let held=reduce(ready,{type:'HOLD_UPDATE',reason:'Confirm latest forecast'});assert.equal(held.stage,6);assert.equal(held.revision,ready.revision+1);assert.equal(held.approvedAt,null);assert.equal(held.reviewedAt,null);assert.equal(held.holdCount,1);assert.strictEqual(reduce(held,{type:'APPROVE_UPDATE'}),held);
held=tick(held,9);assert.equal(held.stage,8);assert.equal(held.revision,ready.revision+3);assert.equal(held.partnerReadyAt,ready.partnerReadyAt);assert.equal(held.reviewedAt,ready.tick+5);assert.equal(held.approvedAt,null);assert.equal(held.decision,'');
for(const action of [{type:'APPROVE_UPDATE'},{type:'MODIFY_UPDATE',message:'Human-revised partner update',channel:channels[1],updateMinutes:5,reason:'Use partner email and earlier follow-up'}]){
 let branch=reduce(held,action);assert.equal(branch.stage,9);assert.equal(branch.choice,'A');assert.ok(branch.approvedAt);assert.equal(branch.message,action.message||recommendedMessage);assert.equal(branch.channel,action.channel||channels[0]);
 assert.strictEqual(reduce(branch,action),branch);
 branch=tick(branch,17);assert.equal(branch.stage,11);assert.ok(branch.events.some(e=>e.text.includes(branch.message)));assert.deepEqual(reduce(branch,{type:'RESET'}),initial());
}
for(let stage=0;stage<=11;stage++)assert.deepEqual(reduce({...s,stage,paused:true,holdCount:4,message:'edited'},{type:'RESET'}),initial());
assert.equal(JSON.stringify({agents,tasks,findings}),fixtures);
console.log('PASS: seven agents/contracts; ordered analysis, governance, partner preparation; 45s readiness; pause/resume; approval guards; hold/reassessment; modified message/channel/cadence; audit; 12-stage reset preserves configuration.');

for(const scenario of ['driver','zone','duplicate']){
 let x=reduce(initial(),{type:'SELECT_SCENARIO',scenario});assert.equal(x.scenario,scenario);
 assert.deepEqual(reduce(x,{type:'RESET'}),x);
 x=reduce(x,{type:'START'});assert.equal(x.stage,1);assert.strictEqual(reduce(x,{type:'SELECT_SCENARIO',scenario:'accessible'}),x);
 x=tick(x,9);assert.equal(x.stage,3);
 const stop=reduce(x,{type:'PAUSE'});assert.strictEqual(tick(stop,100),stop);x=reduce(stop,{type:'RESUME'});
 x=tick(x,36);
 if(scenario==='zone'){
  assert.equal(x.stage,8);assert.equal(x.partnerReadyAt,45);assert.equal(tick(x,200).stage,8);
  const held=reduce(x,{type:'HOLD_UPDATE',reason:'Recheck configuration'});assert.equal(held.stage,6);x=tick(held,9);assert.equal(x.stage,8);
  assert.strictEqual(reduce(reduce(x,{type:'PAUSE'}),{type:'APPROVE_UPDATE'}).stage,8);
  x=reduce(x,{type:'MODIFY_UPDATE',message:'Reviewed zone update',channel:channels[1],updateMinutes:5,reason:'Partner preference'});assert.equal(x.stage,9);x=tick(x,17);
  assert.ok(x.events.some(e=>e.text.includes('Reviewed zone update')));
 }else x=tick(x,40);
 assert.equal(x.stage,11);assert.equal(x.approvedAt!==null,scenario==='zone');
 if(scenario!=='zone')assert.ok(x.events.every(e=>e.kind!=='Partner'));
 assert.ok(x.events.every(e=>!e.text.includes('INC-0512')&&!e.text.includes('DEMO-WAV-02')));
 assert.deepEqual(reduce(x,{type:'RESET'}),initial(scenario));
 assert.deepEqual(reduce(reduce(x,{type:'RESET'}),{type:'SELECT_SCENARIO',scenario:'accessible'}),initial());
}
console.log('PASS: scenario selection locked during run; distinct autonomous/partner/discovery paths; hold and modify; pause; isolated audit; selected-scenario reset; return to hero.');

assert.equal(status(2,{...initial('zone'),stage:4}),'Idle');
assert.equal(status(4,{...initial('zone'),stage:4}),'Reconciling');
assert.equal(status(2,{...initial('duplicate'),stage:3}),'Idle');
assert.equal(status(5,{...initial('duplicate'),stage:3}),'Idle');
assert.equal(status(6,{...initial('duplicate'),stage:3}),'Reviewing');
assert.equal(status(2,{...initial('driver'),stage:3}),'Investigating');
for(const scenario of ['driver','zone','duplicate'])for(let i=0;i<7;i++)assert.equal(agentOutput(i,initial(scenario)).length,8);
console.log('PASS: expertise-specific status combinations and all eight-field agent contracts.');

const {measure}=await import('../lib/measurement.ts');
for(const scenario of ['accessible','driver','zone','duplicate']){
 let x=tick(initial(scenario),29);
 assert.equal(measure(x).resolution,null);assert.equal(measure(x).validated,null);
 x=reduce(x,{type:'START'});x=tick(x,5);assert.equal(measure(x).validated,5);
 x=tick(x,35);assert.equal(measure(x).resolution,null);
 x=tick(x,1);assert.equal(measure(x).resolution,36);
 let frozen=reduce(x,{type:'PAUSE'});assert.deepEqual(measure(tick(frozen,100)),measure(frozen));
 if(['accessible','zone'].includes(scenario)){
  x=tick(x,4);assert.equal(measure(x).partnerReady,40);assert.equal(measure(x).touchpoints,0);
  x=reduce(x,{type:'HOLD_UPDATE',reason:'Recheck'});assert.equal(measure(x).touchpoints,1);
  x=tick(x,9);assert.equal(measure(x).resolution,36);assert.equal(measure(x).partnerReady,40);
  x=reduce(x,{type:'MODIFY_UPDATE',message:'Reviewed message',channel:channels[0],updateMinutes:5,reason:'Adjusted wording'});
  assert.equal(measure(x).touchpoints,2);assert.equal(measure(x).humanReview,9);
 }else{assert.equal(measure(x).partner,false);assert.equal(measure(x).partnerReady,null);assert.equal(measure(x).touchpoints,0);}
 assert.equal(measure(reduce(x,{type:'RESET'})).resolution,null);assert.equal(measure(reduce(x,{type:'RESET'})).touchpoints,0);
 assert.equal(measure(x).resolutionBaseline,measure(x).baseline.steps.slice(1,5).reduce((a,b)=>a+b,0));
}
console.log('PASS: event-derived measurement origins; first readiness after Governance; applicable partner metric; pause/T0 exclusion; hold/modify touchpoints; baseline sums; measurement reset.');
