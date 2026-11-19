import type {State} from './simulation.ts';
export const baselines={
 accessible:{steps:[3,6,8,5,3,4],calls:12},
 driver:{steps:[2,4,5,3,2,0],calls:9},
 zone:{steps:[3,8,8,6,3,4],calls:11},
 duplicate:{steps:[4,6,5,5,3,0],calls:6}
};
export const baselineSteps=['Validate signal','Gather operational context','Coordinate specialist input','Evaluate tradeoffs / explanations','Validate evidence package','Prepare partner communication'];
export function measure(s:State){
 const first=(stage:number)=>s.events.find(e=>e.stage===stage)?.at??null;
 const confirmed=first(2),ready=first(s.scenario==='driver'?9:s.scenario==='duplicate'?11:7);
 const partner=s.scenario==='accessible'||s.scenario==='zone';
 const elapsed=(end:number|null,start:number|null)=>end===null||start===null?null:end-start;
 const b=baselines[s.scenario],resolutionBaseline=b.steps.slice(1,5).reduce((a,b)=>a+b,0);
 return {confirmed,ready,partner,validated:elapsed(confirmed,s.incidentAt),resolution:elapsed(ready,confirmed),partnerReady:partner?elapsed(s.partnerReadyAt,confirmed):null,touchpoints:s.holdCount+(s.approvedAt!==null?1:0),humanReview:elapsed(s.approvedAt,s.partnerReadyAt),cycles:s.events.length,baseline:b,resolutionBaseline,partnerBaseline:resolutionBaseline+b.steps[5],modeledCost:(b.calls*0.01).toFixed(2)};
}
