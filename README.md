# Agentic Operations Command Center

**Interactive prototype:** [Open the live demo](https://agentic-operations-command-center.gv30.workers.dev/)

A portfolio project exploring how an operations team can investigate incidents, coordinate specialized workstreams, and keep consequential decisions under human control. Built around a **fictional on-demand mobility service** with synthetic data.

**My contribution:** I defined the product concept, incident scenarios, operating workflow, evidence requirements, human approval controls, and review criteria. I directed iterative design, testing, and deployment using AI-assisted software development. This is an independent prototype, not a commercial deployment.

## The problem

Operational disruptions create fragmented evidence, competing priorities, and pressure to act before facts are verified. This prototype tests a coordinated response: specialized roles examine different aspects of an incident, share a common case state, and escalate decisions that require human judgment.

## Try the demo

1. Start with **Accessible Vehicle Disruption**.
2. Follow the case through **Office**, **Mission Control**, **Decisions**, **Impact**, and **Audit**.
3. Inspect the evidence and the simulated actions of seven specialized operational roles.
4. At the decision point, approve, modify, or hold a *simulated* partner update. No message is actually sent.
5. Open **Ask the case** to question the evidence. The assistant identifies whether it is using Gemini or prepared reference responses.
6. Reset and explore **Driver Availability**, **Zone Booking**, and **Duplicate-Trip Discovery** to see how the workflow changes by scenario.

See the [three-minute walkthrough](public/demo-script.md) for an interview-friendly sequence.

## What I designed and tested

- Four incident scenarios with different activation paths, assumptions, and consequences.
- Seven role-specific simulated workstreams coordinated through one shared case record.
- Human approval, modification, and hold controls for consequential modeled decisions.
- An evidence trail, impact measurements, and an audit view that distinguish actions from verified outcomes.
- A scoped case assistant that uses synthetic scenario facts and cannot execute operations.
- Test cases for scenario progression, role activation, decisions, reference answers, and API validation.

## Technology

| Layer | Tools |
| --- | --- |
| Frontend | React, TypeScript, Vite, Tailwind CSS |
| State and simulation | TypeScript reducer, scenario fixtures, deterministic workflow logic |
| Assistant API | Cloudflare Workers, server-side validation and synthetic evidence grounding |
| Optional generative AI | Google Gemini 2.5 Flash-Lite via server-side API key |
| Deployment | Cloudflare Workers, GitHub-based workflow |
| Tests | Node test scripts, TypeScript type checking, production build |

### How the AI works

**The seven operational roles are deterministic simulations, not seven autonomous LLM agents.** The optional **Ask the case** feature is the part that can call a generative model. With a valid server-side Gemini key, it generates an answer grounded in the selected synthetic scenario; without one, it returns explicitly labeled prepared reference answers. A provider failure can also trigger that labeled fallback. The browser cannot access the key.

```text
React + TypeScript interface
    |-- Four synthetic scenarios and seven simulated roles
    |-- Shared case state, human gates, impact and audit
    '-- Ask the case
           |-- Cloudflare Worker validates question and context
           |-- Gemini if configured and available
           '-- Labeled reference response otherwise
```

## Run locally

Requires Node.js 22.13+ and npm.

```bash
npm install
npm run dev
```

The four simulations work without an API key. To enable Gemini locally, copy `.dev.vars.example` to `.dev.vars` and set `GEMINI_API_KEY` privately. Do **not** commit `.dev.vars`, `.env`, credentials, or tokens.

```bash
npm run test
npm run typecheck
npm run build
```

See [Cloudflare deployment instructions](docs/CLOUDFLARE_DEPLOYMENT.md) and [implementation notes](public/implementation.md). The demo link is the intended deployment address; public availability and live Gemini operation should be tested separately after deployments.

## Boundaries

- No real company, city, rider, vehicle, dispatcher, partner, or production system is represented.
- All incidents, service levels, policies, identities, and numerical measurements are **synthetic**. They are not verified commercial results or ROI.
- No real dispatch, messages, payments, or external operational actions occur.
- The simulated audit is session-based, not a production-grade persistent record.
- This is a demonstration of product and operational design, not a claim of production-ready security, real integrations, or autonomous multi-agent execution.
- A publicly available AI-enabled endpoint can consume provider quota; usage limits and abuse controls should be reviewed before distributing the demo widely.

## More detail

- [Demo script](public/demo-script.md)
- [Technical implementation](public/implementation.md)
- [Design assumptions and pushback register](public/pushback-register.md)
- [Verification checklist](docs/PORTFOLIO_HANDOFF.md)

Developed as an independent portfolio prototype with AI-assisted implementation and iterative review. No transportation provider has endorsed or supplied data to the project.
