import { validateCaseQuery, referenceAnswer, groundingPrompt, isOutOfScope, modelSystemInstruction } from './assistant.ts';

interface Env { GEMINI_API_KEY?: string; }
const noStore = { 'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff', 'Referrer-Policy':'no-referrer' };
const json = (value:unknown,status=200)=>Response.json(value,{status,headers:noStore});

export async function handleCaseRequest(req:Request, env:Env):Promise<Response> {
  const url = new URL(req.url);
  if (url.pathname==='/api/health' && req.method==='GET') {
    return json({status:'ok',aiConfigured:Boolean(env.GEMINI_API_KEY),mode:env.GEMINI_API_KEY?'model-available':'reference-only'});
  }
  if (url.pathname !== '/api/chat') return json({error:'Not found'},404);
  if (req.method!=='POST') return json({error:'Method not allowed'},405);
  const origin = req.headers.get('origin');
  if (origin && origin!==url.origin) return json({error:'Cross-origin requests are not allowed'},403);
  if (!req.headers.get('content-type')?.includes('application/json')) return json({error:'JSON body required'},415);
  const length = Number(req.headers.get('content-length')||0);
  if (length > 4096) return json({error:'Request too large'},413);
  let raw:unknown;
  try {
    const bodyText=await req.text();
    if(bodyText.length>4096)return json({error:'Request too large'},413);
    raw=JSON.parse(bodyText);
  } catch { return json({error:'Invalid JSON'},400); }
  const query=validateCaseQuery(raw);
  if (!query) return json({error:'Question, scenario or stage invalid'},400);
  if (!env.GEMINI_API_KEY || isOutOfScope(query.question)) return json(referenceAnswer(query));
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),12000);
  try {
    const res=await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent',{
      method:'POST',
      headers:{'Content-Type':'application/json','x-goog-api-key':env.GEMINI_API_KEY},
      body:JSON.stringify({
        systemInstruction:{parts:[{text:modelSystemInstruction}]},
        contents:[{role:'user',parts:[{text:groundingPrompt(query)}]}],
        generationConfig:{temperature:0.2,maxOutputTokens:360},
      }),
      signal:controller.signal,
    });
    if (!res.ok) throw new Error(`Model service returned ${res.status}`);
    const payload=await res.json() as {candidates?:Array<{content?:{parts?:Array<{text?:string}>}}>};
    const answer=payload.candidates?.[0]?.content?.parts?.map(p=>p.text||'').join('').trim();
    if (!answer) throw new Error('Empty model response');
    return json({answer,mode:'gemini',sources:['Server-side synthetic scenario fixture','State-machine snapshot']});
  } catch {
    return json({...referenceAnswer(query),mode:'reference-fallback',notice:'Live model request unavailable. Showing a prepared, deterministic answer from the scenario fixtures.'});
  } finally {clearTimeout(timeout);}
}

export default {
  fetch: (request:Request,env:Env) => handleCaseRequest(request,env),
};
