# rchub-qa

**Curated, token-efficient QA documentation for AI coding agents.**

AI agents burn thousands of tokens reading verbose official docs, only to extract the 10% they actually need. rchub-qa gives them pre-distilled, agent-optimized testing docs — so they write correct test code on the first try, using a fraction of the tokens.

Part of the [ratl.ai](https://ratl.ai) open source program. Built on [Context Hub](https://github.com/contexthub/context-hub).

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![npm version](https://img.shields.io/npm/v/rchub-qa.svg)](https://www.npmjs.com/package/rchub-qa)

---

## The Problem

Every time an AI agent writes test code, it either:

1. **Guesses from training data** — works for common patterns, fails on edge cases, version-specific APIs, and less popular tools
2. **Reads official docs** — accurate but massively wasteful:

```
Playwright official docs:  ~50,000 tokens across multiple pages
rchub-qa Playwright doc:   ~2,000 tokens, everything an agent needs

That's a 25x token reduction per lookup.
```

Multiply this across every test file, every framework, every session — and you're burning significant tokens (and money) on documentation retrieval alone.

## The Solution

rchub-qa provides **curated, code-first QA documentation** designed specifically for how LLMs consume information:

```bash
# Install the CLI
npm install -g rchub-qa

# Agent fetches exactly what it needs
rchub-qa get playwright/testing --lang py    # ~2,000 tokens
rchub-qa get jest/testing --lang js          # ~2,000 tokens
rchub-qa get deepeval/llm-testing --lang py  # ~2,000 tokens
```

The agent gets a complete, working reference — installation, core APIs, common patterns, best practices — in a single, focused document.

## Token Savings: The Numbers

Here's what this looks like in practice for a typical QA workflow:

### Single test file

| Action | Without rchub-qa | With rchub-qa | Savings |
|--------|-----------------|---------------|---------|
| Agent reads Playwright docs | ~15,000 tokens | ~2,000 tokens | **87%** |
| Agent reads assertion patterns | ~8,000 tokens | included above | **100%** |
| Agent searches Stack Overflow for gotchas | ~10,000 tokens | 0 (annotations) | **100%** |
| **Total per test file** | **~33,000 tokens** | **~2,000 tokens** | **94%** |

### Typical QA sprint (50 test files across a project)

| Metric | Without rchub-qa | With rchub-qa |
|--------|-----------------|---------------|
| Doc retrieval tokens | ~500,000 | ~10,000 |
| Redundant lookups | ~40 repeated searches | 1 fetch, cached |
| Known gotcha re-encounters | 10+ per sprint | 0 (annotations) |
| Estimated token cost (GPT-4o) | ~$2.50 | ~$0.05 |
| Estimated token cost (Claude Opus) | ~$10.00 | ~$0.20 |

### Why the savings are so large

1. **No noise** — Official docs include tutorials, marketing, beginner explanations, migration guides. rchub-qa has only what agents need to write code.

2. **No repeated lookups** — The agent fetches once, gets everything. No browsing 5 pages to find the right selector syntax.

3. **No re-learning** — Annotations persist across sessions. The agent doesn't rediscover the same workarounds every time.

## What's Included

### Browser & E2E Testing

| Tool | Python | JavaScript | What it covers |
|------|--------|------------|----------------|
| **Playwright** | Yes | Yes | Selectors, assertions, network mocking, auth state, tracing, mobile emulation |
| **Selenium** | Yes | Yes | WebDriver, waits, action chains, frames, alerts, cross-browser |
| **Cypress** | — | Yes | DOM queries, cy.intercept, fixtures, custom commands, component testing |

### Mobile Testing

| Tool | Python | JavaScript | What it covers |
|------|--------|------------|----------------|
| **Appium** | Yes | Yes | iOS/Android, gestures, hybrid apps, device actions, UiAutomator/XCUITest |

### Unit & Component Testing

| Tool | Python | JavaScript | What it covers |
|------|--------|------------|----------------|
| **Pytest** | Yes | — | Fixtures, parametrize, markers, mocking, async, plugins |
| **Jest** | — | Yes | Matchers, mocks, spies, timers, snapshots, module mocking |
| **Vitest** | — | Yes | Vite-native, matchers, mocking, concurrent tests, type testing, benchmarks |
| **Testing Library** | — | Yes | DOM/React queries, user events, accessibility-first, async utilities |

### API Testing

| Tool | Python | JavaScript | What it covers |
|------|--------|------------|----------------|
| **requests/httpx** | Yes | — | HTTP methods, auth, sessions, response validation, async, mocking with responses |
| **Supertest** | — | Yes | Express testing, request chaining, auth, file upload, middleware testing |

### Performance & Load Testing

| Tool | Python | JavaScript | What it covers |
|------|--------|------------|----------------|
| **Locust** | Yes | — | User behaviors, task weighting, custom shapes, distributed, CI assertions |
| **k6** | — | Yes | Virtual users, scenarios, thresholds, checks, data parameterization, CI/CD |

### Accessibility Testing

| Tool | Python | JavaScript | What it covers |
|------|--------|------------|----------------|
| **axe-core** | Yes | Yes | WCAG compliance, Playwright/Cypress integration, scoped audits, CI/CD checks |

### Visual Regression Testing

| Tool | Python | JavaScript | What it covers |
|------|--------|------------|----------------|
| **BackstopJS** | — | Yes | Screenshot comparison, responsive testing, scenarios, custom scripts, CI/CD |

### Contract Testing

| Tool | Python | JavaScript | What it covers |
|------|--------|------------|----------------|
| **Pact** | Yes | Yes | Consumer-driven contracts, matchers, provider verification, Pact Broker, CI/CD |

### LLM/AI Testing

| Tool | Python | JavaScript | What it covers |
|------|--------|------------|----------------|
| **DeepEval** | Yes | — | LLM metrics, faithfulness, hallucination, RAG eval, custom criteria |
| **Promptfoo** | — | Yes | Prompt eval, model comparison, red-teaming, assertions, CI/CD |

### Enterprise QA

| Tool | Python | JavaScript | What it covers |
|------|--------|------------|----------------|
| **Robot Framework** | Yes | — | Keyword-driven, Browser/Selenium integration, API testing, data-driven, CI/CD |

## CLI Usage

### Install

```bash
npm install -g rchub-qa
```

Or use directly with npx:

```bash
npx rchub-qa list
```

### List all available docs

```bash
rchub-qa list
```

```
  Available QA docs:

  ID                                  Language       Description
  ———————————————————————————————————— —————————————— ——————————————————————————————————————————————————
  playwright/testing                   [javascript]   Playwright browser automation and testing...
  playwright/testing                   [python]       Playwright browser automation and testing...
  selenium/webdriver                   [javascript]   Selenium WebDriver for browser automation...
  ...
```

### Search docs

```bash
rchub-qa search "e2e testing"
rchub-qa search "api"
rchub-qa search "performance"
rchub-qa search "accessibility"
```

### Fetch a specific doc

```bash
rchub-qa get playwright/testing --lang js
rchub-qa get pytest/testing --lang py
rchub-qa get k6/performance-testing --lang js
```

### Annotate — teach the agent across sessions

```bash
# Add a gotcha
rchub-qa annotate playwright/testing "page.route() must be called before page.goto() to intercept initial requests"

# Add a version-specific note
rchub-qa annotate cypress/e2e-testing "Cypress 14+: cy.intercept routeHandler receives StaticResponse, not a function"

# View annotations for a doc
rchub-qa annotate playwright/testing

# List all annotations
rchub-qa annotate --list

# Export annotations (for sharing with team)
rchub-qa annotate --export > annotations.json

# Import annotations from team
rchub-qa annotate --import annotations.json
```

When you fetch a doc with `rchub-qa get`, annotations are automatically appended:

```
...
---
## Annotations

- [2026-03-06] page.route() must be called before page.goto() to intercept initial requests
```

### Use without installing (direct file access)

If you prefer not to use the CLI, the docs work as plain markdown files:

```bash
git clone https://github.com/<your-username>/rchub-qa.git
cat rchub-qa/content/playwright/docs/testing/javascript/DOC.md
```

Point your agent at the files directly in CLAUDE.md or system prompt:

```
When writing tests, read the relevant DOC.md from the rchub-qa/content/ directory.
For Playwright JS: rchub-qa/content/playwright/docs/testing/javascript/DOC.md
```

## How It Works

### 1. Agent searches and fetches

```bash
rchub-qa search "e2e testing"
# Results:
#   playwright/testing    Browser automation and testing
#   selenium/webdriver    WebDriver for browser automation
#   cypress/e2e-testing   End-to-end testing framework

rchub-qa get playwright/testing --lang js
# Returns: complete, focused doc (~500 lines / ~2,000 tokens)
```

### 2. Agent writes correct code immediately

Because the doc is **code-first and pattern-focused**, the agent produces idiomatic code on the first attempt:

```typescript
// Agent writes this after reading rchub-qa Playwright doc:
test('login flow', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('user@test.com');
  await page.getByLabel('Password').fill('secret');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await expect(page).toHaveURL(/.*dashboard/);
});
```

No `page.waitForSelector`. No deprecated APIs. No guessing. Correct on the first try.

### 3. Agent annotates what it learns (the real value)

This is where rchub-qa fundamentally changes how agents work with QA tools:

```bash
# Session 1: Agent discovers a gotcha
rchub-qa annotate playwright/testing "page.route() must be called before page.goto() to intercept initial requests"

# Session 2, 3, 4...: These annotations appear automatically in `rchub-qa get` output
```

**The agent never makes the same mistake twice.** Across sessions, across tasks, across team members.

### The annotation compound effect

```
Session 1:  Agent writes tests, hits 3 gotchas, annotates them
Session 2:  Agent avoids those 3 gotchas, finds 1 more, annotates
Session 3:  Agent avoids all 4, writes clean tests immediately
Session 10: Agent has accumulated deep, project-specific QA knowledge
```

This is the difference between an agent that starts from zero every session and one that **gets smarter over time**.

## Tell Your Agent to Use It

Add to your agent's instructions (CLAUDE.md, system prompt, etc.):

```
Before writing test code, run `rchub-qa search "<framework>"` to find relevant docs,
then `rchub-qa get <id> --lang <py|js>` to fetch them. After discovering
gotchas or workarounds, run `rchub-qa annotate <id> "<note>"` to save them
for future sessions.
```

For Claude Code, create a skill:

```bash
mkdir -p ~/.claude/skills/qa-docs
```

Then create `~/.claude/skills/qa-docs/SKILL.md`:

```markdown
# QA Documentation Skill

When writing tests or test automation code:

1. Run `rchub-qa search "<framework>"` to find relevant QA docs
2. Run `rchub-qa get <id> --lang <py|js>` to fetch the curated doc
3. Use the doc patterns to write correct, idiomatic test code
4. If you discover a gotcha, run `rchub-qa annotate <id> "<note>"`
```

## Why This Matters for QA Specifically

QA is uniquely expensive for AI agents because:

1. **Testing frameworks have large API surfaces** — Playwright alone has 200+ methods. Agents need the right 20.

2. **Selector strategies vary wildly** — `getByRole` vs `css` vs `xpath` vs `data-testid`. Wrong choice = flaky tests. The docs encode best practices.

3. **Gotchas are common and subtle** — Timing issues, race conditions, platform-specific quirks. These are hard to learn from training data alone.

4. **Tests are repetitive** — A project might have 100+ test files using the same patterns. Fetching docs once vs. 100 times is a massive difference.

5. **LLM testing is new** — Tools like DeepEval and Promptfoo are recent. Agent training data is thin here. Curated docs fill a real gap.

6. **QA spans many categories** — E2E, API, performance, accessibility, visual regression, contract testing. Agents need the right tool for each job.

## Where rchub-qa Adds the Most Value

| Context | Value | Why |
|---------|-------|-----|
| Mainstream libraries (React, Playwright) | Low-Medium | Agents mostly know these, but docs prevent version-specific mistakes |
| Less common tools (Appium, Locust, k6, Pact) | **Medium-High** | Agents make more mistakes; curated docs catch gotchas |
| LLM testing (DeepEval, Promptfoo) | **High** | Very recent tools with thin training data |
| Enterprise frameworks (Robot Framework) | **High** | Complex keyword syntax that agents struggle with |
| Internal/private APIs | **Highest** | Agents have zero training data — add your own docs |
| Teams with annotation history | **Grows over time** | More sessions = smarter agent |

The core value isn't the docs themselves — it's the **annotation loop**. The docs are the vehicle, the learning-across-sessions is the payload.

## Team Usage

### Shared annotations

Annotations are stored locally at `~/.rchub-qa/annotations.json`. For team-wide sharing:

```bash
# Export
rchub-qa annotate --export > annotations.json

# Commit to repo
git add annotations.json && git commit -m "Update QA annotations"

# Teammates import
rchub-qa annotate --import annotations.json
```

## Content Format

Each doc follows Context Hub's format — YAML frontmatter + markdown:

```yaml
---
name: testing
description: "Playwright browser automation and testing..."
metadata:
  languages: "python"
  versions: "1.51.0"
  revision: 1
  updated-on: "2026-03-06"
  source: community
  tags: "playwright,testing,browser,automation,e2e,web"
---
```

The `versions` field lets agents detect staleness by comparing against `package.json` or `requirements.txt`.

## Contributing

We welcome contributions — especially from QA engineers who know the gotchas. See [CONTRIBUTING.md](CONTRIBUTING.md).

**High-impact contributions:**
- Adding docs for missing QA tools (Detox, Puppeteer, TestCafe, Artillery, etc.)
- Adding language variants (Python docs for JS-only tools, etc.)
- Improving existing docs with real-world patterns and gotchas
- Submitting annotations from your team's testing experience

## Roadmap

- [ ] More QA tools: Detox, Puppeteer, TestCafe, Artillery, Playwright Python visual regression
- [ ] Testing skill files (reusable test patterns as SKILL.md)
- [ ] Staleness detection (auto-flag docs behind latest npm/pypi versions)
- [ ] Token usage tracking and reporting
- [ ] Integration with CI/CD for automated QA doc updates
- [ ] Security testing docs (OWASP ZAP, Burp Suite CLI)
- [ ] Test data management patterns

## License

[MIT](LICENSE) — part of the [ratl.ai](https://ratl.ai) open source program.
