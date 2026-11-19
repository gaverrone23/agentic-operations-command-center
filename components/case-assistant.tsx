import { useEffect, useRef, useState } from 'react';
import { Bot, Send, X, RotateCcw, Sparkles } from 'lucide-react';
import type { State } from '@/lib/simulation';
import { scenarioName } from '@/lib/scenarios';

type Message={role:'user'|'assistant';text:string;mode?:'gemini'|'reference'|'reference-fallback';notice?:string;sources?:string[]};
const questions=[
  'What is happening in this scenario?',
  'Which agents are involved and why?',
  'When is human approval required?',
  'What evidence supports the plan?',
];

export function CaseAssistant({state}:{state:State}) {
  const [open,setOpen]=useState(false);
  const [question,setQuestion]=useState('');
  const [messages,setMessages]=useState<Message[]>([]);
  const [loading,setLoading]=useState(false);
  const [enabled,setEnabled]=useState<boolean|null>(null);
  const previousStage=useRef(state.stage);
  useEffect(()=>{setMessages([]);setQuestion('');},[state.scenario]);
  useEffect(()=>{
    if(state.stage===0 && previousStage.current>0) setMessages([]);
    previousStage.current=state.stage;
  },[state.stage]);
  useEffect(()=>{
    let active=true;
    fetch('/api/health').then(async r=>(await r.json()) as {aiConfigured?:boolean}).then(x=>{if(active)setEnabled(Boolean(x.aiConfigured));}).catch(()=>{if(active)setEnabled(false);});
    return ()=>{active=false;};
  },[]);
  async function ask(text:string) {
    const q=text.trim(); if(!q||loading)return;
    setMessages(m=>[...m,{role:'user',text:q}]);setQuestion('');setLoading(true);
    try {
      const controller=new AbortController();
      const timeout=setTimeout(()=>controller.abort(),15000);
      let response:Response;
      try {
        response=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question:q,scenario:state.scenario,stage:state.stage,paused:state.paused}),signal:controller.signal});
      } finally {clearTimeout(timeout);}
      const data=(await response.json()) as {error?:string;answer?:string;mode?:Message['mode'];notice?:string;sources?:string[]};
      if(!response.ok)throw new Error(data.error||'Request rejected');
      if(typeof data.answer!=='string')throw new Error('Invalid assistant response');
      setMessages(m=>[...m,{role:'assistant',text:data.answer!,mode:data.mode,notice:data.notice,sources:data.sources}]);
    } catch {
      setMessages(m=>[...m,{role:'assistant',text:'The case assistant is temporarily unavailable. The simulation itself remains fully interactive. Please retry or inspect the Audit view.'}]);
    } finally {setLoading(false);}
  }
  return <>
    <button className="assistant-launcher" onClick={()=>setOpen(v=>!v)} aria-expanded={open} aria-controls="case-assistant-panel" aria-label={open?'Close case assistant':'Open case assistant'}><Bot size={20}/><span>Ask the case</span></button>
    {open&&<aside className="assistant-panel" id="case-assistant-panel" aria-label="Case assistant">
      <div className="assistant-head"><div><div className="assistant-title"><Sparkles size={17}/> Case Assistant</div><small>{enabled?'Gemini-powered when available':'Reference mode: synthetic fixtures'}</small></div><button aria-label="Close assistant" onClick={()=>setOpen(false)}><X size={19}/></button></div>
      <div className="assistant-scope"><b>{scenarioName(state.scenario)}</b><span>Stage {state.stage} · simulated evidence only · no external actions</span></div>
      <div className="assistant-messages" aria-live="polite">
        {messages.length===0&&<><p className="assistant-intro">Ask why agents took an action, what the case evidence supports, or where human judgment matters. Answers are grounded in fictional case fixtures.</p><div className="assistant-suggestions">{questions.map(q=><button key={q} onClick={()=>void ask(q)}>{q}</button>)}</div></>}
        {messages.map((m,i)=><div className={`assistant-message ${m.role}`} key={i}><div className="assistant-message-text">{m.text}</div>{m.role==='assistant'&&<small>{m.mode==='gemini'?'Gemini response':m.mode==='reference-fallback'?'Prepared reference · model unavailable':m.mode==='reference'?'Prepared reference · no model inference':'Assistant unavailable'}{m.sources?.length?' · '+m.sources.join(', '):''}{m.notice?<span className="assistant-notice">{m.notice}</span>:null}</small>}</div>)}
        {loading&&<p className="assistant-loading">Reviewing the synthetic evidence…</p>}
      </div>
      <form className="assistant-compose" onSubmit={e=>{e.preventDefault();void ask(question);}}><input aria-label="Question about selected scenario" placeholder="Ask about this case…" value={question} onChange={e=>setQuestion(e.target.value)} maxLength={400} disabled={loading}/><button disabled={loading||!question.trim()} aria-label="Send question"><Send size={16}/></button></form>
      <div className="assistant-footer"><span>Demo-only. Not live operational advice.</span><button onClick={()=>setMessages([])}><RotateCcw size={12}/> Clear</button></div>
    </aside>}
  </>;
}
