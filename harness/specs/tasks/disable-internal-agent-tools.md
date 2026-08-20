---
id: disable-internal-agent-tools
title: Disable control-plane agent tools in InsightAll
taskType: runtime-bridge
intent: Prevent InsightAll agents from invoking Gateway, node, and goal-management control-plane tools while preserving application-owned Gateway RPCs and agent orchestration tools.
scenario: gateway-backend-communication
touchedAreas:
  - electron/utils/openclaw-auth.ts
  - tests/unit/openclaw-auth.test.ts
  - tests/unit/sanitize-config.test.ts
  - README.md
  - README.zh-CN.md
  - README.ja-JP.md
  - README.ru-RU.md
  - harness/specs/rules/active-config-guards.md
  - harness/specs/scenarios/gateway-backend-communication.md
  - harness/specs/tasks/disable-internal-agent-tools.md
expectedUserBehavior:
  - InsightAll agents cannot invoke gateway, nodes, create_goal, get_goal, or update_goal.
  - Message, session orchestration, subagent, and agent discovery tools remain available unless another explicit policy denies them.
  - Gateway-exposed tools cannot bypass the agent-level restriction.
  - Existing user-defined tool deny entries remain intact and in their original order.
  - InsightAll application-owned Gateway RPCs continue to work because tool policy does not block internal RPC methods.
requiredProfiles:
  - fast
  - comms
requiredTests:
  - tests/unit/openclaw-auth.test.ts
  - tests/unit/sanitize-config.test.ts
acceptance:
  - Config sanitization adds every required control-plane tool to tools.deny and gateway.tools.deny without adding message or session-orchestration tools.
  - Repeated sanitization is idempotent and does not duplicate deny entries.
  - Existing deny entries are preserved in their original order.
  - Existing InsightAll-required deny entries remain enforced.
  - Targeted unit tests, type checks, communication regression checks, and harness validation pass.
docs:
  required: true
---

InsightAll keeps application-owned Gateway communication and agent orchestration available while preventing models from invoking selected control-plane tools directly. The restriction is enforced at both insightAll tool-policy layers.
