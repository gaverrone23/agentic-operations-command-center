# Cloudflare deployment | Agentic Operations Command Center

## Deployment path

Use **Cloudflare Workers Builds** with the private GitHub repository rather than uploading a ZIP or creating a Cloudflare Pages-only site.

Repository: `gaverrone23/agentic-operations-command-center`

The repository is already configured for the Cloudflare Vite plugin and has `wrangler.jsonc`, a server-side Worker API and a React SPA. The GitHub Actions workflow verifies the simulation tests, assistant tests, type checking, and production build.

## Initial one-time setup (Cloudflare account owner)

1. Open Cloudflare dashboard -> **Compute** -> **Workers & Pages** -> **Create application**.
2. Choose to connect/import a **GitHub** repository and authorize only `gaverrone23/agentic-operations-command-center` if repository-scoped permissions are offered.
3. Select the repository and configure:

| Field | Value |
|---|---|
| Worker name | `agentic-operations-command-center` |
| Git branch | `main` |
| Root directory | repository root (`/`, or leave blank if the UI defaults to root) |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |
| Build/deployment API token | Cloudflare-generated default |
| Secrets | None needed for first reference-mode deployment |

4. Select **Save and Deploy**. The Worker name **must** match `wrangler.jsonc`; do not rename it in only one place.
5. Verify Cloudflare reports a successful build/deployment. Copy the assigned `workers.dev` URL; do not assume its subdomain in advance.

**Do not deploy from the 'upload folder/ZIP' option.** That approach is not equivalent to connecting the code and backend API.

## Launch acceptance checks

At the live `workers.dev` URL:

- The homepage, navigation, and pixel-art Office render; the console shows no fatal errors.
- Every scenario can be selected, started, advanced and reset.
- The accessible-vehicle scenario exercises human approval/hold/modify decisions and retains expected audit records.
- Alternate scenarios activate meaningfully different modeled roles; irrelevant roles can remain idle.
- Impact and Audit reflect the selected scenario.
- `GET /api/health` responds with `{"status":"ok", "aiConfigured":false, "mode":"reference-only"}` in the initial no-key deployment (ignoring JSON formatting).
- In the chat, ask: "Why is human approval needed?" The answer must explain the modeled scenario without pretending the seven agents are independent LLMs. Chat must be explicitly labeled **Reference mode** without a Gemini key.
- Verify no external company name, logo, original interview location or personal attribution is present in page, prompts or displayed case evidence.
- Check one narrow/mobile viewport and one normal laptop viewport before distributing the link.

## Optional live AI after reference-mode release

A Gemini key is **not required** for the initial deploy. If enabling live AI:

1. Open the deployed Worker's **Settings -> Variables and Secrets** in Cloudflare.
2. Add `GEMINI_API_KEY` as an encrypted **Secret** (runtime secret, not a browser variable or checked-in `.env` file).
3. Redeploy or apply the Worker version if Cloudflare prompts.
4. Verify `/api/health` says `aiConfigured:true`; ask a scenario-specific question and confirm the assistant labels the response `gemini`.
5. Try an unrelated query and verify it is refused. Test unavailable-key/provider-failure fallback.
6. Set spending and usage limits at the AI provider. Apply rate limiting/abuse controls before broadly sharing a public AI-enabled endpoint. A public URL can incur model usage from anyone who visits.

Do **not** put API keys, credential values, or tokens in chat, GitHub issues, code, or screenshots.

## Future updates

When GitHub is connected through Workers Builds, new commits pushed to `main` trigger a Cloudflare deployment using the saved build settings. Continue using the GitHub Actions verification before accepting changes.

## Deployment troubleshooting

- **Wrong project type:** Use Cloudflare **Worker** with repository integration, not static-only Pages or drag-and-drop uploads.
- **Worker name conflict:** Ensure the dashboard name matches `wrangler.jsonc`.
- **Build failure:** First inspect Cloudflare build logs and the GitHub Actions run for the same commit.
- **Blank UI:** Inspect the browser console and confirm the Vite client assets were deployed alongside the Worker.
- **Chat returns HTML:** Check Worker routing for `/api/chat` and `/api/health`; the backend must run before SPA fallback for `/api/*`.
- **Assistant shows Reference mode:** Expected until `GEMINI_API_KEY` is configured server-side.
- **Gemini fails:** Keep the application usable with labeled reference fallback; inspect provider quota/model availability.

References:
- [Cloudflare Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/)
- [Workers Builds configuration](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/)
- [Cloudflare Vite plugin](https://developers.cloudflare.com/workers/vite-plugin/)
