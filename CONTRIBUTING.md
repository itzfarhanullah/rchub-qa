# Contributing to rchub-qa

Thanks for helping make AI agents better at QA. Here's how to contribute.

## What We Need

### High-priority contributions

1. **New QA tool docs** — Detox, Puppeteer, TestCafe, Artillery, Nightwatch, WebdriverIO, etc.
2. **Language variants** — Python docs for JS-only tools (or vice versa). Currently missing: BackstopJS Python, Vitest equivalent in Python, Supertest Python
3. **Real-world annotations** — Gotchas, workarounds, and patterns from your team's testing experience
4. **Doc improvements** — Better examples, missing patterns, version updates
5. **Security testing docs** — OWASP ZAP, Burp Suite CLI, Snyk
6. **Test data management** — Faker, Factory Boy, fixtures patterns

### Content principles

- **Code-first.** A working example is worth more than a paragraph of explanation.
- **Agent-optimized.** Write for LLMs, not humans. No introductions, no marketing, no beginner tutorials.
- **90% coverage.** Cover what agents need 90% of the time. Put edge cases in reference files.
- **Token-efficient.** Every line should earn its place. If an agent won't use it, cut it.

## Adding a New QA Tool Doc

### 1. Create the directory structure

```
content/
  <tool-name>/
    docs/
      <entry-name>/
        python/
          DOC.md         # Python variant
        javascript/
          DOC.md         # JavaScript variant
```

For single-language tools (like Cypress), skip the language subdirectory if there's only one.

### 2. Write the frontmatter

```yaml
---
name: <entry-name>
description: "One-line description of the tool for search results"
metadata:
  languages: "python"           # or "javascript"
  versions: "1.0.0"             # package version on npm/pypi
  revision: 1                   # bump on content updates
  updated-on: "2026-03-06"      # date of last revision
  source: community             # community, maintainer, or official
  tags: "tool,testing,qa,..."   # comma-separated
---
```

### 3. Write the content

Follow this structure:

1. **Installation** — one command, get going
2. **Quick start** — minimal working example
3. **Core API** — the 20% of methods used 80% of the time
4. **Common patterns** — real-world usage patterns agents will replicate
5. **Integration** — how it works with test runners (pytest, jest, etc.)
6. **Tips** — gotchas, best practices, things agents get wrong

### 4. Submit a PR

```bash
git checkout -b add-<tool-name>-docs
git add content/<tool-name>/
git commit -m "Add <tool-name> QA docs"
git push -u origin add-<tool-name>-docs
```

## Updating Existing Docs

When updating content for the same package version:

1. Bump `revision` (e.g., 1 -> 2)
2. Update `updated-on` to today's date
3. Keep `versions` the same

When updating for a new package version:

1. Update `versions` to the new version
2. Reset `revision` to 1
3. Update `updated-on`
4. Update any changed APIs, patterns, or examples

## Quality Checklist

Before submitting, verify:

- [ ] Frontmatter has all required fields (name, description, metadata.languages, metadata.versions, metadata.revision, metadata.updated-on, metadata.source, metadata.tags)
- [ ] Code examples are complete and runnable (not pseudocode)
- [ ] No marketing language or filler text
- [ ] Covers installation, quick start, core API, and common patterns
- [ ] Token-efficient — no redundant sections or verbose explanations
- [ ] Tested with an AI agent to verify the doc produces correct code

## Submitting Annotations

If your team has discovered gotchas that other agents would benefit from:

1. List your annotations: `rchub-qa annotate --list`
2. Add relevant ones as a "Tips" section at the bottom of the DOC.md
3. Submit a PR

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
