# Codex work order: verify and publish the portfolio copy

**Scope:** Work only from this anonymized repository. Never import the original private project or its Git history. Do not reintroduce a company, city, personal name, interview relationship, original service URL, or confidential source material.

## First: prove the app runs

1. Run `npm install` with Node 22+ in an environment with npm registry access.
2. Run `npm run test`, `npm run typecheck`, and `npm run build`; address compilation and packaging issues without changing scenario behavior.
3. Run `npm run dev` and visually inspect all five views, including the pixel-art Office, on desktop and mobile widths.
4. Exercise each scenario from Start through completion and Reset. The accessible vehicle and zone booking scenarios require partner-communication human gates; driver availability and duplicate-trip discovery must not invent partner updates.
5. Test Ask the case in no-key Reference mode and verify that it accurately identifies itself as **non-LLM reference output**. Optionally set a private Gemini key for an end-to-end test of the Worker; never commit it.
6. Run a case-insensitive source and built-output check for names and URLs of the original interview company and project. Confirm zero identifying references remain. Do not expose an original Git commit history.

## Then: version control and deployment

1. Create a new standalone GitHub repository named `agentic-operations-command-center`, with no imported history.
2. Commit only this anonymized source. Keep environment secrets out of the repository.
3. For Cloudflare Workers, use the existing `wrangler.jsonc` and `vite.config.ts`, follow `README.md`, authenticate to an account owned by the project author, and deploy the built application.
4. Test the public URL from an incognito browser without login, including all four scenarios, the chatbot fallback, responsive layout and synthetic-data disclaimers.
5. Configure usage and abuse controls before sharing a Gemini-enabled public assistant broadly. If a provider limit makes model chat unreliable, keep Reference mode available and label it honestly.

## Acceptance criteria

- No broken build or missing static assets.
- No regression in the deterministic seven-role/four-scenario workflow.
- Functional, clearly labeled case assistant; no secrets exposed in browser code.
- No company-specific references anywhere in deployed files, source tree, README, favicon, metadata, API prompts or public documentation.
- A shareable URL, a clean GitHub repository, and a concise report of all commands, tests and remaining limitations.

**Do not redesign the Office or expand the scope.**
