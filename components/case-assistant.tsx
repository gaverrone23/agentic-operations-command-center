import { useEffect, useRef, useState } from 'react';
import { Bot, Send, X, RotateCcw, Sparkles, ArrowLeftRight } from 'lucide-react';
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
  const [side,setSide]=useState<'left'|'right'>('right');
  const endRef=useRef<HTMLDivElement|null>(null);
  const activeRequest=useRef<AbortController|null>(null);
  const previousStage=useRef(state.stage);
  useEffect(()=>{activeRequest.current?.abort();setMessages([]);setQuestion('');setLoading(false);},[state.scenario]);
  useEffect(()=>{
    if(state.stage===0 && previousStage.current>0){
      activeRequest.current?.abort();
      setMessages([]);
      setLoading(false);
    }
    previousStage.current=state.stage;
  },[state.stage]);
  useEffect(()=>{
    let active=true;
    fetch('/api/health').then(async r=>(await r.json()) as {aiConfigured?:boolean}).then(x=>{if(active)setEnabled(Boolean(x.aiConfigured));}).catch(()=>{if(active)setEnabled(false);});
    return ()=>{active=false;};
  },[]);
  useEffect(()=>{
    if(open)endRef.current?.scrollIntoView({block:'end',behavior:'smooth'});
  },[open,messages,loading]);
  function clearConversation(){
    activeRequest.current?.abort();
    setMessages([]);
    setQuestion('');
    setLoading(false);
  }
  async function ask(text:string) {
    const q=text.trim(); if(!q||loading)return;
    const history=messages.slice(-6).map(m=>({role:m.role,text:m.text.slice(0,480)}));
    const controller=new AbortController();
    activeRequest.current=controller;
    setMessages(m=>[...m,{role:'user',text:q}]);
    setQuestion('');
    setLoading(true);
    const timeout=setTimeout(()=>controller.abort(),15000);
    try {
      const response=await fetch('/api/chat',{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({question:q,scenario:state.scenario,stage:state.stage,paused:state.paused,history}),
        signal:controller.signal
      });
      const data=(await response.json()) as {error?:string;answer?:string;mode?:Message['mode'];notice?:string;sources?:string[]};
      if(!response.ok)throw new Error(data.error||'Request rejected');
      if(typeof data.answer!=='string')throw new Error('Invalid assistant response');
      if(!controller.signal.aborted)setMessages(m=>[...m,{role:'assistant',text:data.answer!,mode:data.mode,notice:data.notice,sources:data.sources}]);
    } catch {
      if(!controller.signal.aborted)setMessages(m=>[...m,{role:'assistant',text:'The case assistant is temporarily unavailable. The simulation itself remains fully interactive. Please retry or inspect the Audit view.'}]);
    } finally {
      clearTimeout(timeout);
      if(activeRequest.current===controller){activeRequest.current=null;setLoading(false);}
    }
  }
  return <>
    <button className="assistant-launcher" onClick={()=>setOpen(v=>!v)} aria-expanded={open} aria-controls="case-assistant-panel" aria-label={open?'Close case assistant':'Open case assistant'}><Bot size={20}/><span>Ask the case</span></button>
    {open&&<aside className="assistant-panel" data-side={side} id="case-assistant-panel" aria-label="Case assistant">
      <div className="assistant-head"><div><div className="assistant-title"><Sparkles size={17}/> Case Assistant</div><small>{enabled?'Gemini key detected · verify each reply':'Reference mode · synthetic evidence'}</small></div><div className="assistant-head-actions"><button className="assistant-side-toggle" title={side==='right'?'Move chat left':'Move chat right'} aria-label={side==='right'?'Move chat left':'Move chat right'} onClick={()=>setSide(v=>v==='right'?'left':'right')}><ArrowLeftRight size={17}/></button><button aria-label="Close assistant" onClick={()=>setOpen(false)}><X size={19}/></button></div></div>
      <div className="assistant-scope"><b>{scenarioName(state.scenario)}</b><span>Stage {state.stage} · simulated evidence only · no external actions</span></div>
      <div className="assistant-messages" aria-live="polite">
        {messages.length===0&&<><p className="assistant-intro">Ask why agents took an action, what the case evidence supports, or where human judgment matters. Answers are grounded in fictional case fixtures.</p><div className="assistant-suggestions">{questions.map(q=><button key={q} onClick={()=>void ask(q)}>{q}</button>)}</div></>}
        {messages.map((m,i)=><div className={`assistant-message ${m.role}`} key={i}><div className="assistant-message-text">{m.text}</div>{m.role==='assistant'&&<small>{m.mode==='gemini'?'Gemini response':m.mode==='reference-fallback'?'Gemini failed · prepared reference':m.mode==='reference'?'Prepared reference · no model inference':'Assistant unavailable'}{m.sources?.length?' · '+m.sources.join(', '):''}{m.notice?<span className="assistant-notice">{m.notice}</span>:null}</small>}</div>)}
        {loading&&<p className="assistant-loading">Reviewing the synthetic evidence…</p>}
        <div ref={endRef} className="assistant-message-end" aria-hidden="true" />
      </div>
      <form className="assistant-compose" onSubmit={e=>{e.preventDefault();void ask(question);}}><input aria-label="Question about selected scenario" placeholder="Ask about this case…" value={question} onChange={e=>setQuestion(e.target.value)} maxLength={400} disabled={loading}/><button disabled={loading||!question.trim()} aria-label="Send question"><Send size={16}/></button></form>
      <div className="assistant-footer"><span>Demo-only. Not live operational advice.</span><button onClick={clearConversation}><RotateCcw size={12}/> Clear</button></div>
    </aside>}
  </>;
}
