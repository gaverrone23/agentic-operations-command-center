'use client';
import type {CSSProperties} from 'react';
import {agents,initials,State,status,isWorking} from '@/lib/simulation';
const desks=[[160,245],[435,305],[175,485],[435,525],[690,485],[690,245],[950,370]];
const colors=['#77c9f1','#66e5c6','#b8a2ef','#ef9ab9','#c8d789','#efc16f','#8db8ee'];
function Plant({x,y}:{x:number;y:number}){return <g transform={`translate(${x} ${y})`}><ellipse cy="24" rx="24" ry="9" fill="#152a30" opacity=".4"/><path d="M-14 0H14L10 26H-10Z" fill="#bf9371"/><rect x="-16" y="-4" width="32" height="8" fill="#d4af88"/><path d="M0 0V-34M0-14L-18-30M0-22L17-40" stroke="#5c9a72" strokeWidth="7"/><path d="M-20-20L-27-38L-9-34ZM5-29L9-50L24-41ZM-4-30L-14-52L3-45Z" fill="#80b28a"/></g>}
function Desk({i,st,paused,onSelect}:{i:number;st:string;paused:boolean;onSelect:(i:number)=>void}){
 const [x,y]=desks[i],active=isWorking(st),waiting=st==='Waiting for Human',complete=['Confirmed','Synchronized','Validated'].includes(st);
 const shown=paused&&active?'Paused':st;
 return <g transform={`translate(${x} ${y})`} className={`office-person ${active?'working':''} ${waiting?'human-wait':''} ${st==='Monitoring'?'monitoring':''} ${i===1?'coordinator':''}`} style={{'--role-color':colors[i],'--motion-delay':`${i*-.17}s`} as CSSProperties} data-state={st} data-paused={paused} role="button" tabIndex={0} aria-label={`${agents[i]} · ${shown} · Open runbook and evidence`} onClick={()=>onSelect(i)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onSelect(i)}}}>
 <title>{agents[i]} — {shown}. Select to open the existing runbook and evidence.</title>
 <rect className="desk-focus" x="-98" y="-98" width="196" height="235" rx="16" fill="none" stroke="transparent" strokeWidth="3"/>
 <ellipse className="desk-aura" cy="29" rx="101" ry="74" fill={colors[i]} opacity=".04"/>
 <ellipse cx="4" cy="63" rx="77" ry="19" fill="#101e29" opacity=".35"/>
 {/* A small desk, monitor, keyboard and office chair; the whole station is one click target. */}
 <path d="M-73-13V37H-62V-13M62-13V37H73V-13" fill="#455566"/>
 <path d="M-85-55H85V-2H-85Z" fill="#627185"/><path d="M-85-55H85V-9H-85Z" fill="#a99d89"/><path d="M-82-52H82V-43H-82Z" fill="#c5b69b"/><path d="M-85-9H85V0H-85Z" fill="#766e65"/>
 <rect x="-60" y="-93" width="86" height="54" rx="4" fill="#243345"/><rect className="desk-screen" x="-54" y="-87" width="74" height="41" fill="#284655"/><path d="M-22-39V-30M-37-29H-6" stroke="#3a485a" strokeWidth="6"/>
 <g className="screen-activity" stroke={colors[i]} strokeWidth="3"><path d="M-45-74H-13M-45-64H4M-45-54H-25"/><path d="M3-75H11V-67H3Z" fill={colors[i]} stroke="none"/></g>
 <rect x="-49" y="-23" width="61" height="13" rx="2" fill="#455264"/><path d="M-42-18H4" stroke="#94a8ba" strokeWidth="2" strokeDasharray="4 3"/>
 <rect x="46" y="-36" width="17" height="20" fill="#d7e0db"/><path d="M63-32H68V-22H63" fill="none" stroke="#d7e0db" strokeWidth="3"/>
 {i===4&&<g><rect x="-77" y="-38" width="17" height="22" fill="#748da4"/><path d="M-74-34H-63M-74-29H-63" stroke="#c7d5db" strokeWidth="2"/></g>}
 <rect x="1" y="35" width="47" height="43" rx="9" fill="#243646"/><path d="M24 70V82M8 84H40" stroke="#7a8894" strokeWidth="5"/>
 {/* Little puppet teammate: distinct role color, face and headwear. No independent activity state. */}
 <g className="avatar-position"><g className="desk-avatar">
 <path d="M9 48V67H19V48M30 48V67H40V48" fill="#26384e"/>
 <path d="M5 16H43V50H5Z" fill={colors[i]}/><path d="M16 20H31V42H16Z" fill="#eef5ed" opacity=".35"/>
 <path className="typing-hand hand-left" d="M5 20H-6V-1H3V13H10" fill={colors[i]}/><path className="typing-hand hand-right" d="M42 20H54V-2H45V13H38" fill={colors[i]}/>
 <rect x="6" y="-23" width="37" height="35" rx="8" fill="#ddd4bd"/><rect x="10" y="-14" width="29" height="18" rx="4" fill="#263b4b"/>
 <path d="M16-7V-1M31-7V-1" stroke={colors[i]} strokeWidth="4"/>
 {i===0?<path d="M1-10V1M48-10V1M4-12V-24H45V-12" fill="none" stroke={colors[i]} strokeWidth="5"/>:i===1?<path d="M10-26V-34H18V-29H29V-34H37V-26" fill={colors[i]}/>:i===5?<path d="M14-23V-31H35V-23" fill={colors[i]}/>:<path d="M9-24V-29H40V-24" fill={colors[i]}/>}
 <text x="24" y="37" textAnchor="middle" fontSize="10" fontWeight="700" fill="#243646">{initials[i]}</text>
 </g>
 </g>
 {waiting&&<g className="human-beacon"><path d="M56-87H83V-64H71L63-56V-64H56Z" fill="#efc16f"/><text x="69" y="-69" textAnchor="middle" fontSize="17" fontWeight="bold" fill="#342d23">!</text></g>}
 {complete&&<g key={st} className="office-completion"><circle cx="70" cy="-75" r="14" fill="#66d5aa"/><path d="M63-75L68-70L77-81" fill="none" stroke="#123d32" strokeWidth="3"/></g>}
 <text x="0" y="99" textAnchor="middle" className="office-agent-name">{agents[i]}</text>
 <text x="0" y="121" textAnchor="middle" className={`office-agent-status ${waiting?'waiting':''}`}><tspan>{shown}</tspan></text>
 </g>;
}
export function TeamOffice({state:s,onSelect}:{state:State;onSelect:(i:number)=>void}){
 return <section className="panel illustrated-office"><div className="section-head"><div><span className="eyebrow">DEMO CITY OPERATIONS OFFICE</span><h2>Seven teammates. One Shared Case State.</h2></div><span className="muted small">Select a teammate or desk to inspect its work</span></div><div className="office-scene-scroll" role="region" aria-label="Seven-agent digital office" tabIndex={0}><svg data-paused={s.paused} data-coordinating={status(1,s)==='Coordinating'} data-reviewing={status(6,s)==='Reviewing'} data-human={status(5,s)==='Waiting for Human'} className="office-scene" viewBox="0 0 1100 710" role="group" aria-label="Illustrated operations office with seven interactive agent workstations">
 <defs><pattern id="office-floor" width="70" height="48" patternUnits="userSpaceOnUse"><rect width="70" height="48" fill="#253742"/><path d="M0 47H70M69 0V48" stroke="#30434d" strokeWidth="1"/></pattern><pattern id="office-rug" width="14" height="14" patternUnits="userSpaceOnUse"><rect width="14" height="14" fill="#294952"/><path d="M0 7H14" stroke="#35545d" strokeWidth="2"/></pattern></defs>
 {/* Room shell and furnishings deliberately stay behind all interactive desks. */}
 <rect x="15" y="35" width="1070" height="650" rx="14" fill="#101d2a"/>
 <path d="M30 85H1070V650H30Z" fill="url(#office-floor)"/><path d="M30 22H1070V85H30Z" fill="#4a5d70"/><path d="M30 85V652H15V22H30M1070 22H1085V652H1070" fill="#758395"/><path d="M30 652H1070V668H30Z" fill="#536373"/>
 <path d="M40 93H1059" stroke="#111f2c" strokeWidth="7"/>
 {/* Windows, city lights, wall board and a compact bookcase make the scene read as an office. */}
 {[85,635].map(x=><g key={x}><rect x={x} y="33" width="120" height="45" fill="#142c42" stroke="#92a9b7" strokeWidth="4"/><path d={`M${x+60} 34V76M${x} 55H${x+120}`} stroke="#8aa7b7" strokeWidth="3"/><path d={`M${x+14} 67V60H${x+31}V67M${x+78} 68V45H${x+91}V68`} stroke="#4c7b94" strokeWidth="7"/></g>)}
 <rect x="275" y="32" width="270" height="91" rx="3" fill="#c1cecb" stroke="#6c8290" strokeWidth="7"/><text x="410" y="56" textAnchor="middle" fontSize="14" fontWeight="700" fill="#304a55">DEMO CITY • OPERATIONS</text><path d="M304 91L331 73L363 97L400 78L444 101L488 76L523 93" fill="none" stroke="#5c9293" strokeWidth="3"/><g fill="#518880"><circle cx="331" cy="73" r="4"/><circle cx="400" cy="78" r="4"/><circle cx="488" cy="76" r="4"/></g>
 <rect className="coordination-zone" x="318" y="180" width="234" height="264" rx="20" fill="url(#office-rug)" stroke="#537473" strokeWidth="2"/><text x="435" y="205" textAnchor="middle" fontSize="13" fill="#a4c6bf" letterSpacing="2">COORDINATION HUB</text>
 {/* Clear side room for independent oversight, with an open doorway. */}
 <rect className="oversight-zone" x="816" y="106" width="239" height="522" fill="#2b3b4d"/><path d="M806 93V270M806 410V652" stroke="#97b1c0" strokeWidth="8"/><path d="M806 93V270M806 410V652" stroke="#486774" strokeWidth="3"/><path d="M814 269H845V406H814" fill="none" stroke="#5d7b89" strokeWidth="2"/><path d="M817 270Q931 270 931 384" fill="none" stroke="#65828c" strokeWidth="1" strokeDasharray="5 6"/>
 <text x="939" y="137" textAnchor="middle" fontSize="13" fill="#b8cde0" letterSpacing="2">OVERSIGHT</text>
 <rect x="862" y="162" width="157" height="74" fill="#718492"/><rect x="868" y="168" width="145" height="61" fill="#263c50"/>{[0,1,2].map(j=><g key={j}><rect x={883+j*42} y="178" width="29" height="37" fill={['#afc3bc','#a5b8cd','#c4b28e'][j]}/><path d={`M${890+j*42} 186h15m-15 8h15m-15 8h10`} stroke="#637786" strokeWidth="2"/></g>)}
 <text className="decision-zone" x="690" y="120" textAnchor="middle" fontSize="13" fill="#d7bf8d" letterSpacing="1.5">DECISION RIGHTS</text>
 {/* Lounge and greenery; no extra characters. */}
 <rect x="871" y="548" width="150" height="46" rx="8" fill="#537b86"/><rect x="875" y="537" width="142" height="31" rx="6" fill="#608d97"/><path d="M920 541V568M971 541V568" stroke="#456a79" strokeWidth="3"/>
 <Plant x={66} y={126}/><Plant x={1031} y={105}/><Plant x={74} y={604}/><Plant x={785} y={605}/>

 {[2,3,4].filter(i=>status(i,s)==='Synchronized').map(i=><path key={i} className="office-sync" d={`M${desks[i][0]} ${desks[i][1]-60}L435 245`} fill="none" stroke={colors[i]} strokeWidth="3" strokeDasharray="5 18" pointerEvents="none"/>)}
 {agents.map((_,i)=><Desk key={i} i={i} st={status(i,s)} paused={s.paused} onSelect={onSelect}/>)}
 </svg></div><div className="office-scene-legend"><span>Shared Case State · r{s.revision}</span><span><i className="legend-work"/> Active work</span><span><i className="legend-human"/> Human judgment</span><span>{s.paused?'Paused · activity frozen':'Live states match Mission Control'}</span></div></section>;
}
