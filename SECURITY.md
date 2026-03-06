# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in rchub-qa, please report it responsibly.

**Do not open a public issue for security vulnerabilities.**

Instead, please email the maintainers or use GitHub's private vulnerability reporting feature:

1. Go to the repository's **Security** tab
2. Click **Report a vulnerability**
3. Provide a description of the issue

We will acknowledge your report within 48 hours and aim to provide a fix or mitigation within 7 days.

## Scope

rchub-qa is a documentation and CLI tool. Security concerns are limited to:

- CLI command injection via crafted annotation inputs
- Malicious content in contributed DOC.md files
- Dependency vulnerabilities in the npm package

## Supported Versions

| Version | Supported |
|---------|-----------|
| 0.1.x   | Yes       |
