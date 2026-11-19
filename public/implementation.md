# Implementation overview

This independent simulation uses seven modeled roles coordinated through a deterministic state machine. The UI consists of five views: Office, Mission Control, Decisions, Impact and Audit. Scenario-specific workstreams are defined in code; agent statuses reflect stages and relevant expertise. The impact metrics are illustrative, and all case data is synthetic.

## Workflows

1. **Accessible vehicle disruption:** Validate synthetic signals; investigate fleet availability, accessibility and rider effects; reconcile disagreement; validate the factual package; require human review of any partner update; simulate execution and outcomes.
2. **Driver availability:** Verify the missing-capacity signal before assuming a no-show; investigate replacement supply, effect on riders and possible recurrence. No routine human partner update.
3. **Zone booking anomaly:** Investigate attempted bookings, allowed-zone rules and a simulated configuration discrepancy; prepare a partner update only because the modeled impact is material; require human review before simulated preparation.
4. **Duplicate-trip pattern:** Investigate a possible proactive anomaly, distinguish genuine rebookings from unresolved cases, and propose follow-up without alleging fraud or making booking changes.

## Optional case assistant

The `/api/chat` Worker accepts a bounded question and the selected scenario/stage, then reconstructs context from checked-in synthetic source data. With a server-side API key it calls Gemini; without one or when the provider fails, it returns a labeled deterministic reference answer. The assistant can explain evidence, reasoning limits and human authority. It cannot change the incident state, approve decisions, send messages or access real systems.

## Evidence labels

- Synthetic facts: source fixtures maintained in the application.
- Runbook guidance: designed for the demonstration, not a real operator's policy.
- Reconciliation: modeled reason for selecting an operational plan.
- Impact: simulated results and unverified forecasts.

No live external data, confidential operating knowledge, or production claims are included.
