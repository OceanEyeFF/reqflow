# MS7 Provider Manual Validation Template

## Purpose

Use this record before final MS7 acceptance to manually verify configured OpenAI-compatible providers. This template records operator evidence only; it does not require committing real API keys, local secrets, request payloads, or provider response bodies.

## Secret Handling

- Do not paste real API keys, bearer tokens, `.env` values, provider dashboards, account IDs, billing screenshots, or local private paths into this file.
- For API keys, record only the UI/API observation such as `hasApiKey=true` and a masked suffix like `****abcd` when already displayed by ReqFlow.
- For local providers, record whether `noKeyMode=true` was explicitly enabled.
- If a screenshot is taken, redact secrets before saving it outside the application.

## Environment

| Field | Value |
|---|---|
| tester |  |
| test date/time |  |
| ReqFlow commit |  |
| browser / OS |  |
| database profile | local SQLite / other: |
| knowledge source used | none / markdown / zip / other: |

## DeepSeek API Key Mode

| Field | Value |
|---|---|
| provider label | DeepSeek |
| endpoint base URL |  |
| model |  |
| key mode | API key |
| key observation | hasApiKey=true / maskedApiKey observed: |
| config save result | pass / fail |
| test connection result | pass / fail / not run |
| AI draft end-to-end result | pass / fail / not run |
| citation behavior | citations shown / no eligible knowledge / incorrect / not run |
| operator-visible error, if any |  |
| secret leakage check | pass / fail |
| notes |  |

### DeepSeek Checklist

- [ ] Admin can open `/admin/ai-provider`.
- [ ] Saving endpoint/model/key succeeds without exposing plaintext key on readback.
- [ ] Test connection succeeds or records an operator-safe provider error.
- [ ] `/tickets/ai-discussion` can produce a draft when provider is available.
- [ ] Draft citations are visible when enabled knowledge snippets match the request.
- [ ] No plaintext API key appears in browser UI, API response, console, or saved evidence.

## Local OpenAI-Compatible No-Key Mode

Use this section for LMStudio, Ollama OpenAI-compatible proxy, or another localhost-compatible provider that intentionally requires no API key.

| Field | Value |
|---|---|
| provider label | LMStudio / Ollama / other: |
| endpoint base URL |  |
| model |  |
| key mode | no-key local |
| no-key observation | noKeyMode=true / other: |
| config save result | pass / fail |
| test connection result | pass / fail / not run |
| AI draft end-to-end result | pass / fail / not run |
| citation behavior | citations shown / no eligible knowledge / incorrect / not run |
| operator-visible error, if any |  |
| Authorization header expectation | no Authorization header sent / unknown |
| notes |  |

### Local Provider Checklist

- [ ] Local provider is running before the test starts.
- [ ] Admin can save localhost endpoint/model with explicit no-key mode.
- [ ] Test connection succeeds or records an operator-safe local provider error.
- [ ] AI draft generation succeeds when the local provider is available.
- [ ] Failure with local provider stopped is operator-safe and does not expose secrets.

## Negative / Failure Cases

| Case | Expected Result | Actual Result | Pass/Fail |
|---|---|---|---|
| Missing required endpoint or model | Config validation blocks save or test |  |  |
| Cloud provider with empty key and no no-key mode | Config/test rejects unsafe empty-key cloud use |  |  |
| Wrong API key | Test connection fails with operator-safe error |  |  |
| Wrong model | Test connection or draft fails with operator-safe error |  |  |
| Local provider stopped | Test connection fails with operator-safe error |  |  |
| Non-admin opens provider API/UI | 401/403 or no admin controls |  |  |

## Acceptance Summary

| Question | Answer |
|---|---|
| DeepSeek API key mode verified? | yes / no / blocked |
| Local no-key mode verified? | yes / no / blocked |
| Test connection and AI draft were distinguished? | yes / no |
| Knowledge citations were checked when applicable? | yes / no / not applicable |
| Any secret leakage observed? | no / yes: |
| Remaining blocker before MS7 acceptance? | no / yes: |

## Sign-Off

| Role | Name | Date | Decision |
|---|---|---|---|
| tester |  |  | pass / fail / blocked |
| final MS7 acceptance owner | fdch0 |  | accept / reject / needs follow-up |

Final MS7 acceptance remains a programmer decision. Do not mark MS7 accepted from this template alone unless the final acceptance owner explicitly approves it.
