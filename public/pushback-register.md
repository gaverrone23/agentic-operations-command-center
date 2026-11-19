# Interview questions and defensible answers

**Are there seven actual AI agents?**

No. There are seven specialized modeled roles, with deterministic orchestration and case-specific logic. The optional chat assistant can make a genuine Gemini model call when configured. Distinguishing those mechanisms is important.

**What is genuinely functional?**

Scenario selection, incident state transitions, agent-activity changes, human decision controls, simulated impact calculations and audit events. The chatbot's prepared reference mode works without model credentials; live AI requires a configured, working backend key.

**Why use a deterministic engine?**

To make a repeatable, auditable interview demonstration. Operational decisions have strict guardrails and should not depend on free-form generated text. A real implementation would need verified APIs, authorization, role-specific tools, monitoring, and operational validation.

**Why human approval?**

Routine investigation and evidence preparation can be automated in the model. Material partner-facing communications and policy changes require accountable human judgment. The simulator can prepare but does not send any external messages.

**What is the ROI?**

No real ROI is claimed. The Impact view demonstrates how recovery time, human touchpoints, rider effects, forecast accuracy and model cost could be measured in a pilot. A real baseline and controlled comparison would be needed.

**What would be your next step in a real organization?**

Choose one validated operational friction, establish a baseline with operators, confirm authority boundaries, integrate a read-only event feed, test against historic and adversarial cases, then run a tightly bounded shadow pilot before considering any real action.
