import {alternateScenarios,scenarioLibrary} from './scenarios.ts';
import type {ScenarioId} from './scenarios.ts';
export const agents = ['Disruption Monitor','Operations Orchestrator','Fleet & Routing','Rider Impact','Knowledge & Policy','Safety / Human Decision','Governance & Quality'];
export const initials=['DM','OO','FR','RI','KP','HD','GQ'];
export const stages=['Normal operation','Signal validation','Incident confirmed','Parallel investigation','Evidence reconciliation','Recovery plan ready','Governance factual review','Preparing partner update','Partner update required','Simulated execution','Outcome verification','Learning review'];
export const durations:Record<number,number>={1:5,2:4,3:12,4:10,5:5,6:5,7:4,9:9,10:8};
export const channels=['Prepare Zendesk ticket','Prepare partner email','Draft Slack update'] as const;
export const recommendedMessage='Demo City Transit service update: accessible vehicle DEMO-WAV-02 became unavailable at approximately 5:12 PM. Seven booked/upcoming trips are affected, including one requiring wheelchair-accessible service. Our team has validated the disruption and reconciled the current fleet manifest. The recovery plan uses a nearby accessible vehicle after a safe drop-off and redistributes the other six trips. We expect service recovery within 34 minutes of recovery execution. The accessible pickup is estimated to be 14 minutes later than its original commitment; two downstream riders are expected to incur 6 additional minutes each. These are estimates, not guarantees: elevated traffic may change arrival times, and the unavailable vehicle’s return time remains unknown. We will provide another update within 10 minutes of this update, or sooner if the recovery plan changes.';
export type Event={at:number;stage:number;revision:number;text:string;kind:'Operation'|'Partner'|'Outcome'};
export type State={scenario:ScenarioId;stage:number;revision:number;tick:number;elapsed:number;paused:boolean;choice:string;decision:string;reason:string;events:Event[];incidentAt:number|null;partnerReadyAt:number|null;reviewedAt:number|null;approvedAt:number|null;holdCount:number;message:string;channel:string;updateMinutes:number};
export type Action={type:string;scenario?:ScenarioId;message?:string;channel?:string;updateMinutes?:number;reason?:string};
export const initial=(scenario:ScenarioId='accessible'):State=>({scenario,stage:0,revision:0,tick:0,elapsed:0,paused:false,choice:'A',decision:'',reason:'',events:[],incidentAt:null,partnerReadyAt:null,reviewedAt:null,approvedAt:null,holdCount:0,message:scenario==='accessible'?recommendedMessage:alternateScenarios[scenario].message,channel:channels[0],updateMinutes:10});
const messages=['Operating heartbeat active','Vehicle-unavailable signal received: DEMO-WAV-02','Two independent synthetic signals agree. Incident INC-0512 created.','Orchestrator created Fleet, Rider and Policy tasks on shared revision 3.','Fleet challenges immediate diversion. Rider Impact requests current onboard delay evidence.','Current manifest supersedes the +14-minute estimate: two downstream riders incur +6 minutes each. Specialists reconcile; recovery plan A is ready.','Governance checks corroborated facts, accessibility, downstream impact, forecast uncertainty and case applicability.','Governance validated the factual package. Operations Orchestrator created Partner Update task PU-0512.','Partner Update PU-0512 is decision-ready. Operational analysis is complete; human judgment concerns partner messaging, channel and commitments.','Partner update prepared in a simulated outbox. Recovery plan A continues through simulated adapters.','Pickup confirmations collected. Comparing actual rider and service results.','Quality review complete. Partner follow-up and manifest-freshness improvements retained for human review.'];
const kindFor=(stage:number):Event['kind']=>stage>=10?'Outcome':stage>=6?'Partner':'Operation';
export function reduce(s:State,a:Action):State{
 const transition=(stage:number,text=messages[stage]):State=>({...s,stage,revision:s.revision+1,elapsed:0,events:[...s.events,{at:s.tick,stage,revision:s.revision+1,text,kind:kindFor(stage)}]});
 if(a.type==='RESET')return initial(s.scenario);
 if(a.type==='SELECT_SCENARIO')return s.stage===0&&scenarioLibrary.some(x=>x.id===a.scenario)?initial(a.scenario):s;
 if(s.scenario!=='accessible')return reduceAlternate(s,a);
 if(a.type==='PAUSE')return s.paused?s:{...s,paused:true};
 if(a.type==='RESUME')return s.paused?{...s,paused:false}:s;
 if(a.type==='START'&&s.stage===0&&!s.paused)return {...transition(1),incidentAt:s.tick};
 if(s.stage===8&&!s.paused){
  if(a.type==='HOLD_UPDATE'){
   if(!a.reason?.trim())return s;
   return {...transition(6,`Partner update held — ${a.reason.trim()}. No message prepared or sent. Orchestrator requests a bounded manifest/forecast recheck; Governance must review again.`),holdCount:s.holdCount+1,decision:'Held for reassessment',reason:a.reason.trim(),reviewedAt:null};
  }
  if(a.type==='APPROVE_UPDATE'||a.type==='MODIFY_UPDATE'){
   const modified=a.type==='MODIFY_UPDATE';
   const message=modified?a.message?.trim():s.message;
   const channel=modified?a.channel:s.channel;
   const updateMinutes=modified?a.updateMinutes:s.updateMinutes;
   if(!message||!channel||!channels.includes(channel as typeof channels[number])||![5,10,15].includes(updateMinutes||0)||s.reviewedAt===null||modified&&!a.reason?.trim())return s;
   const decision=modified?'Modified and approved':'Approved';
   const reason=a.reason?.trim()||'Accept factual package, partner framing and update commitment.';
   return {...transition(9,`${decision} Partner Update PU-0512. ${channel} — simulated preparation only; no external send. Next update within ${updateMinutes} minutes of initial update. Rationale: ${reason}\nApproved message: ${message}`),decision,reason,message,channel,updateMinutes:updateMinutes!,approvedAt:s.tick};
  }
 }
 if(a.type!=='TICK'||s.paused)return s;
 const n={...s,tick:s.tick+1,elapsed:s.elapsed+1};
 if(durations[s.stage]&&n.elapsed>=durations[s.stage]){
  const stage=s.stage+1;
  const text=stage===7&&s.holdCount>0?'Governance revalidated the current manifest and recovery forecast; no changed facts in this synthetic recheck. Orchestrator refreshed Partner Update PU-0512.':messages[stage];
  return {...n,stage,revision:s.revision+1,elapsed:0,reviewedAt:stage===7?n.tick:s.reviewedAt,partnerReadyAt:stage===8?(s.partnerReadyAt??n.tick):s.partnerReadyAt,decision:stage===8?'':s.decision,events:[...s.events,{at:n.tick,stage,revision:s.revision+1,text,kind:kindFor(stage)}]};
 }
 return n;
}
export function status(i:number,s:State){const p=s.stage;
 if(s.scenario!=='accessible'){const d=alternateScenarios[s.scenario];if(p===0)return i===0||i===6?'Monitoring':'Idle';if(!d.active[p]?.includes(i))return i===0?'Monitoring':'Idle';return p===8?'Waiting for Human':i===6?'Reviewing':p===1?'Validating':p===4?'Reconciling':p===7?'Preparing update':p===9?'Executing':p===10?'Verifying':i===1?'Coordinating':'Investigating';}
 if(p===0)return i===0||i===6?'Monitoring':'Idle';
 if(p===1)return i===0?'Validating':i===6?'Monitoring':'Idle';
 if(p===2)return i===1?'Coordinating':i===0?'Confirmed':'Monitoring';
 if(p===3)return i===1?'Coordinating':[2,3,4].includes(i)?'Investigating':'Monitoring';
 if(p===4)return [1,2,3,4].includes(i)?'Reconciling':'Monitoring';
 if(p===5)return i===1?'Coordinating':[2,3,4].includes(i)?'Synchronized':'Monitoring';
 if(p===6)return i===6?'Reviewing':i===1?'Coordinating':'Monitoring';
 if(p===7)return i===1?'Preparing update':i===6?'Validated':'Monitoring';
 if(p===8)return i===5?'Waiting for Human':i===1?'Awaiting decision':'Monitoring';
 if(p===9)return [1,2,3].includes(i)?'Executing':'Monitoring';
 if(p===10)return i===3||i===6?'Verifying':'Monitoring';
 return i===6?'Reviewing':'Monitoring';
}
export const isWorking=(st:string)=>['Validating','Coordinating','Investigating','Reconciling','Preparing update','Executing','Verifying','Reviewing'].includes(st);
export const tasks=[{agent:0,title:'Validate vehicle unavailability',detail:'Telemetry + driver report · duplicate check',start:1,end:2},{agent:1,title:'Coordinate recovery response',detail:'Shared state · independent work · partner update',start:2,end:11},{agent:2,title:'Evaluate accessible recovery routes',detail:'Nearby WAV vs later capacity · elevated traffic',start:3,end:5},{agent:3,title:'Quantify impact across all riders',detail:'7 originally affected + 2 downstream riders',start:3,end:5},{agent:4,title:'Validate policy and case applicability',detail:'Local conditions before historical analogy',start:3,end:5},{agent:5,title:'Approve partner communication',detail:'Message · channel · follow-up commitment',start:8,end:9},{agent:6,title:'Validate facts and verify outcomes',detail:'Factual package before partner review · outcome checks',start:6,end:11}];
export const boardTasks=[...tasks.slice(0,5).map(t=>({...t,id:`agent-${t.agent}`})),{agent:6,id:'facts',title:'Validate the factual package',detail:'Evidence · accessibility · uncertainty · no unsupported promises',start:6,end:7},{agent:1,id:'partner',title:'Prepare Partner Update PU-0512',detail:'Governance-validated facts · recommended partner message',start:7,end:8},{...tasks[5],id:'human'},{agent:6,id:'outcomes',title:'Verify outcomes and propose learning',detail:'Rider outcomes · service recovery · partner follow-up',start:10,end:11}];
export const options=[{id:'A',name:'Nearby WAV after safe drop-off',desc:'DEMO-WAV-04 completes a safe drop-off, then serves the accessible rider. Split six other trips across suitable vehicles.',wav:14,total:68,onboard:12,minutes:34},{id:'B',name:'Wait for later accessible capacity',desc:'Reserve DEMO-WAV-07 when available at 5:30 PM. Keep nearby WAV service unchanged; split six other trips.',wav:26,total:76,onboard:0,minutes:28},{id:'C',name:'Hold existing assignments',desc:'Maintain existing assignments, notify all seven riders and await capacity. No cancellation or unsafe reassignment.',wav:35,total:145,onboard:0,minutes:45}];
export const findings=[
 ['Unavailable signal corroborated','Telemetry unavailable at 17:12:00 and independent driver report at 17:12:03; event ID unique.','Synthetic telemetry and driver fixtures, SIM-S01/S02','Driver report independent of telemetry; both under 30 seconds old.','Create one incident and activate coordination.','Vehicle return-to-service time unknown.','Fresh contradictory driver confirmation or stale source timestamps.','Create INC-0512; no dispatch during validation.'],
 ['Coordinate a reconciled recovery and decision-ready partner update','Fleet, Rider and Policy tasks synchronize before Governance validates the factual package; then create PU-0512.','Deterministic orchestration protocol v2','One incident; no competing incident consumes reserve capacity.','Separate operational analysis from accountable partner communication.','Capacity may change after synchronization.','A changed manifest, conflicting authority or expired evidence.','Prepare the partner update only after Governance review.'],
 ['Plan A is feasible after safe drop-off','Nearby WAV has two onboard riders; +6 min each after manifest recheck. Later WAV available at 17:30.','Synthetic fleet manifest F02, traffic T01, revision 5','WAV suitability and available wheelchair position confirmed in fixture.','Accessible pickup +14 min; total delay across nine riders 68 min.','Traffic can add 3–5 min.','Occupied wheelchair position, changed drop-off, or >10 min onboard delay per rider.','Use reconciled plan A under modeled operational authority; monitor capacity.'],
 ['Count original and downstream rider impacts separately','7 originally affected trips include 1 accessible trip. Recovery also adds +6 min each to 2 downstream onboard riders.','Synthetic R01–R07 and downstream O01–O02; one rider per modeled trip','Delay measured against original confirmed pickup / arrival.','Report 9 riders total: 7 originally affected + 2 downstream.','Rider acceptance unknown until simulated acknowledgment.','Rider constraints or new accessibility needs.','Measure distribution of delay, not only an average.'],
 ['Analogous case supports splitting trips, not automatic diversion','CASE-014 had an empty spare WAV; current nearby WAV is occupied. Transfer the split-trip pattern only.','Approved synthetic CASE-014; synthetic vehicle availability snapshot only','Demo guardrails and delegated operational authority are design assumptions, not any operator policy.','Keep case memory advisory and current constraints explicit.','Actual contractual recovery and communication authority are not public.','Verified partner runbook or a changed manifest.','Validate local applicability; do not claim real-world operator permissions.'],
 ['Human judgment governs the partner relationship','Operational disagreement is resolved and Governance has validated the factual package before PU-0512 reaches the queue.','Shared Case State; current reviewed partner package','A designated partner manager has demo authority; no real role permissions or communication integration.','Accountable choice of message, channel, tone and follow-up commitment.','Partner expectations, escalation preferences and contractual commitments are unknown.','Changed facts, partner-specific sensitivity or a required communication protocol.','Approve Update, Modify Update, or Hold / Reassess; no automatic external send.'],
 ['Validate the factual package before partner review; verify outcomes afterward','Check signal corroboration, current manifest, rider counts, accessible plan, forecast caveats and applicable memory. After execution, compare pickup receipts and service results.','Synthetic SIM-S01/S02, F02, T01 and Q01; shared incident revisions','Scenario fixtures only; no real-world performance or policy claim.','Prevent unsupported partner promises and distinguish action completion from recovery.','No causal ROI or partner satisfaction estimate from one synthetic case.','Changed evidence, missing receipts or a breached guardrail.','Release the factual package, then measure outcomes; propose improvements without changing guardrails.']
];
export function agentOutput(i:number,s:State):string[]{
 if(s.scenario!=='accessible'){const d=alternateScenarios[s.scenario],t=d.tasks.find(t=>t.agent===i);return [t?t.title:'No task assigned: expertise not required in this scenario',t?t.detail+'. '+d.reconciliation:'Remain available; no invented finding.',d.evidence,d.assumptions,d.plan,d.uncertainty,'New contradictory evidence, invalid baseline or changed service commitments.',d.next];}
 if(i===5&&s.stage>=9)return [`${s.decision} Partner Update PU-0512`,s.message,`Human-reviewed synthetic package; ${s.channel}`,findings[i][3],`Simulated preparation only. Next update within ${s.updateMinutes} minutes.`,findings[i][5],findings[i][6],'Verify recovery outcomes and honor the partner follow-up commitment.'];
 return findings[i];
}
export const contract=['Finding / recommendation','Evidence','Provenance','Assumptions','Expected consequence','Uncertainty','What would change my conclusion?','Recommended next action'];

function reduceAlternate(s:State,a:Action):State {
 const d=alternateScenarios[s.scenario as Exclude<ScenarioId,'accessible'>];
 const transition=(stage:number,text=d.messages[stage],kind:Event['kind']=stage>=10?'Outcome':d.partner&&stage>=7?'Partner':'Operation'):State=>({...s,stage,elapsed:0,revision:s.revision+1,events:[...s.events,{at:s.tick,stage,revision:s.revision+1,text:`${d.id} · ${text}`,kind}]});
 if(a.type==='PAUSE')return s.paused?s:{...s,paused:true};
 if(a.type==='RESUME')return s.paused?{...s,paused:false}:s;
 if(a.type==='START'&&s.stage===0&&!s.paused)return {...transition(1),incidentAt:s.tick};
 if(d.partner&&s.stage===8&&!s.paused){
  if(a.type==='HOLD_UPDATE'&&a.reason?.trim())return {...transition(6,`Partner update held: ${a.reason.trim()}. No message sent. Revalidate configuration evidence and forecast.`,'Partner'),holdCount:s.holdCount+1,decision:'Held for reassessment',reason:a.reason.trim(),reviewedAt:null};
  if(a.type==='APPROVE_UPDATE'||a.type==='MODIFY_UPDATE'){
   const modified=a.type==='MODIFY_UPDATE',message=modified?a.message?.trim():s.message,channel=modified?a.channel:s.channel,updateMinutes=modified?a.updateMinutes:s.updateMinutes;
   if(!message||!channel||!channels.includes(channel as typeof channels[number])||![5,10,15].includes(updateMinutes||0)||s.reviewedAt===null||modified&&!a.reason?.trim())return s;
   const decision=modified?'Modified and approved':'Approved',reason=a.reason?.trim()||'Approve partner framing and follow-up commitment.';
   return {...transition(9,`${decision} PU-ZONE-01. ${channel}; simulated only, no external send. Next update within ${updateMinutes} minutes. Rationale: ${reason}\nApproved message: ${message}`,'Partner'),decision,reason,message,channel,updateMinutes:updateMinutes!,approvedAt:s.tick};
  }
 }
 if(a.type!=='TICK'||s.paused)return s;
 const n={...s,tick:s.tick+1,elapsed:s.elapsed+1};
 if(durations[s.stage]&&n.elapsed>=durations[s.stage]){
  const stage=s.stage===6&&!d.partner?(s.scenario==='duplicate'?11:9):s.stage+1;
  const next=transition(stage,stage===7&&s.holdCount?d.messages[7]+' Evidence rechecked; fixture facts unchanged.':d.messages[stage]);
  return {...next,tick:n.tick,events:next.events.map((e,i)=>i===next.events.length-1?{...e,at:n.tick}:e),reviewedAt:stage===7?n.tick:s.reviewedAt,partnerReadyAt:stage===8?(s.partnerReadyAt??n.tick):s.partnerReadyAt,decision:stage===8?'':s.decision};
 }
 return n;
}
