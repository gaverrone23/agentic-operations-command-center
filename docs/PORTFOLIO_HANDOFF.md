# Agentic Operations Command Center | Portfolio Handoff

**Status:** Source modifications assembled for review. Production deployment, live model verification and cross-browser visual QA are not established by this document.

## Product goals

- Company-neutral interactive portfolio artifact for interviews.
- Public, no-sign-in URL after deployment.
- Four operational scenarios; seven specialized deterministic agent roles; shared case state and audit.
- Optional grounded case chat with a server-side model call, bounded context, clear reference fallback and no execution privileges.
- Free or near-zero cost demo hosting, subject to current limits, API quotas and abuse controls.

## Source and implementation

- `src/App.tsx`: primary five-view simulation interface; `components/` preserves the interactive Office and decision surfaces.
- `lib/simulation.ts`: seven modeled roles, reducer, approvals, pause/resume, measurements and incident events.
- `lib/scenarios.ts`: three additional case fixtures plus four-case selector.
- `lib/measurement.ts`: synthetic measurements.
- `components/case-assistant.tsx`: optional chat box tied to scenario/stage; no mutation of incident state.
- `worker/assistant.ts`: validation, trusted synthetic context, deterministic prepared answers and model grounding rules.
- `worker/index.ts`: Cloudflare Worker API with no-key mode and optional Gemini call.
- `wrangler.jsonc`: same-origin static + API deployment using Cloudflare Workers.

## Scope and truthfulness

The seven agents are deterministic roles. A model is used only for the optional case assistant. The UI contains no real operator brand, no real city or live service context. All source facts, case events, images and metrics should be treated as synthetic. Do not claim real operations, seven independent LLM agents, tested corporate integrations, or validated ROI.

## Verification gates before a public launch

- [ ] Install dependencies successfully from npm; run `npm run test`, `npm run typecheck`, `npm run build`.
- [ ] Confirm each scenario follows the correct branch, including human gates only for accessible vehicle and zone booking.
- [ ] Run visual QA on desktop and mobile for all five views; preserve pixel-art Office appearance.
- [ ] Test reference assistant and live model assistant using an account-owned secret; inspect API errors and fallback labels.
- [ ] Inspect built assets and source for company/city/person identifiers, old URLs, keys and source-map leakage.
- [ ] Check Cloudflare free-tier allowance, Worker CPU constraints, and external provider quota; add abuse controls before broad public distribution.
- [ ] Create a **new** GitHub repository; do not import original private commits or identifying project paths.
- [ ] Connect repository to a fresh Cloudflare Worker and verify publicly accessible URL without sign-in.
- [ ] Rehearse a three-minute interview demonstration and record a short backup video.

## Constraints and known gaps

- No paid dependencies are intentionally required for reference-only mode, but hosting and AI providers can change pricing/quotas.
- Browser scenario state and audit are not durable across page refreshes.
- The case assistant accepts only selected scenario, stage and question; browser state remains illustrative, not server-verified.
- Scope filtering and grounding reduce but cannot eliminate hallucinations or abuse. A production app requires authentication, durable rate limits, monitoring, content review and operator validation.
- Without a valid Gemini key, outputs must continue to be labeled prepared reference answers rather than AI-generated answers.
