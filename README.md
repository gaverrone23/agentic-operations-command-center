# Agentic Operations Command Center

Interactive portfolio prototype of a **fictional** on-demand mobility service. It demonstrates how seven specialized operational roles can coordinate incident investigation, reconcile evidence, measure outcomes and reserve high-consequence decisions for human review.

**No real company, city, operating system, rider data, partner, API or dispatch integration is represented.** All operational events, policies, identities and measurements are synthetic. The seven-role workflow is a **deterministic simulation**, not seven independently deployed LLM agents.

## What you can try

- Select and start one of four scenarios: an accessible-vehicle disruption, driver availability disruption, zone-booking anomaly, or duplicate-trip pattern discovery.
- Follow the same shared case state across **Office**, **Mission Control**, **Decisions**, **Impact**, and **Audit**.
- Review simulated evidence, understand why certain agents activate, and use human approval, modification or hold controls where a partner-facing decision is needed.
- Open **Ask the case**. Without model configuration, the assistant gives visibly labeled reference answers from fixed case data. With Gemini configured, the Worker calls the model server-side, using only the synthetic evidence fixtures.

## Architecture

```text
React + TypeScript + Vite UI
    |-- Deterministic reducer and scenario fixtures (browser state)
    |-- Seven role-specific simulated workstreams
    |-- Impact measurements and audit trail (session only)
    |-- Case Assistant (context from selected scenario and stage)
            |
            v
      /api/chat (Cloudflare Worker)
            |-- Validates request and domain scope
            |-- Builds trusted context from checked-in synthetic fixtures
            |-- No key: labeled deterministic reference response
            |-- Key: Gemini 2.5 Flash-Lite request (server-side secret)
            '-- Provider failure: labeled reference fallback
```

The Worker never invokes real operations, transactions, dispatch APIs, email or partner communications. A successful response is advisory; all operational scenario state changes remain deterministic and driven by user actions and ticks.

## Local development

Requires Node.js 22+ and npm.

```bash
npm install
npm run dev
```

Open the local address printed by Vite. All four incident scenarios work without an API key. In this mode, the assistant explicitly reports **Reference mode**, not live AI.

### Optional Gemini integration

The API key must remain server-side. For local development, copy `.dev.vars.example` to `.dev.vars` and replace the placeholder with your own Gemini API key:

```text
GEMINI_API_KEY=your-key-here
```

Never commit `.dev.vars`, `.env`, or any secrets. The app intentionally does not expose the model key in browser JavaScript. Calls may incur provider usage costs or be subject to free-tier quotas. Use fictional data only.

### Build and test

```bash
npm run test
npm run typecheck
npm run build
npm run preview
```

The simulation tests cover state progression, four scenarios, stage-specific agent behavior, human approval, hold and reset logic. Assistant tests cover input validation, grounded reference mode, scope restrictions and HTTP request handling. Live-model behavior requires an API key and an additional integration test in your own environment.

## Free-tier Cloudflare Workers deployment

1. Create a Cloudflare account and confirm the current free plan suits your expected demo traffic.
2. In the repository root run `npm install`, `npm run test`, and `npm run build`.
3. Authenticate Cloudflare: `npx wrangler login`.
4. Deploy: `npx wrangler deploy` (the build output includes the static app and Worker API).
5. For live AI, set an encrypted server-side secret: `npx wrangler secret put GEMINI_API_KEY`, then redeploy if prompted.
6. Verify the deployed URL, including all four scenario paths and the AI/reference status. Do not publish any private source archive or original interview materials.

The Cloudflare Worker name is `agentic-operations-command-center`. Public URL shape depends on your Cloudflare account, e.g. `https://agentic-operations-command-center.<account>.workers.dev`. This repository alone does not create or activate a live deployment.

**Public endpoint caution:** Anyone who can access the deployed chat endpoint can consume API quota. Before broadly sharing a Gemini-enabled public deployment, configure provider budget/quotas and Cloudflare rate limiting or an equivalent abuse-control mechanism. For interviews, reference mode is a no-key fallback that avoids external model charges.

## Product boundaries and evidence integrity

- **Source of truth:** All case fixtures are committed in `lib/scenarios.ts` and `lib/simulation.ts`. The Worker constructs its own case context from those files. Browser input provides only the question and scenario/stage selection; no external case facts are accepted from a client as authoritative evidence.
- **Human authority:** Only the simulated partner communication requires human approval in the relevant scenarios; no external communication is ever sent.
- **Provenance:** All data and metrics are illustrative, not performance results or confirmed service policies.
- **No production controls:** There is no identity-based authorization, persistent audit ledger, live telemetry, true multi-agent LLM execution, real-world governance, integration monitoring or production operational SLA.
- **Chat scope:** Questions must relate to the demo case. The assistant cannot execute actions. Reference answers are templates. Model responses must be checked against fixture facts; a model request can fail or generate unsupported wording.

## Docs

- [Three-minute demo script](public/demo-script.md)
- [Technical implementation notes](public/implementation.md)
- [Interview questions and limitations](public/pushback-register.md)
- [Development handoff and verification checklist](docs/PORTFOLIO_HANDOFF.md)

## Credits

Independent prototype created with AI-assisted software development, product design, and iterative testing. It is a portfolio demonstration, not a commercial implementation or an endorsement by any transportation provider.