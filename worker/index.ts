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
  // Only coarse, safe diagnostics are exposed. Never include API keys or provider response bodies.
  let failureCode='network_or_provider_error';
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
    if (!res.ok) {
      failureCode=`provider_http_${res.status}`;
      throw new Error('Model provider rejected the request');
    }
    const payload=await res.json() as {candidates?:Array<{content?:{parts?:Array<{text?:string}>}}>};
    const answer=payload.candidates?.[0]?.content?.parts?.map(p=>p.text||'').join('').trim();
    if (!answer) {
      failureCode='empty_model_output';
      throw new Error('Model returned no answer');
    }
    return json({answer,mode:'gemini',sources:['Server-side synthetic scenario fixture','State-machine snapshot']});
  } catch {
    if (controller.signal.aborted) failureCode='timeout';
    const reasons:Record<string,string>={
      provider_http_400:'Provider rejected the request format (HTTP 400)',
      provider_http_401:'Provider rejected the API key (HTTP 401)',
      provider_http_403:'Provider denied access to this model/project (HTTP 403)',
      provider_http_404:'Model endpoint unavailable to this project (HTTP 404)',
      provider_http_429:'Provider quota or rate limit exceeded (HTTP 429)',
      empty_model_output:'Provider returned no usable text',
      timeout:'Provider did not respond within 12 seconds',
      network_or_provider_error:'Provider network request failed',
    };
    const reason=reasons[failureCode]||'Provider returned an error ('+failureCode.replace('provider_http_','HTTP ')+')';
    // Keep the simulation usable without implying that these answers came from Gemini.
    return json({...referenceAnswer(query),mode:'reference-fallback',diagnosticCode:failureCode,
      notice:`Gemini unavailable: ${reason}. This is a prepared reference response, not live model inference.`});
  } finally {clearTimeout(timeout);}
}

export default {
  fetch: (request:Request,env:Env) => handleCaseRequest(request,env),
};
