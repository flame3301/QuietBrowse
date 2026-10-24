# Security Policy

## Supported versions

| Version | Supported |
|---|---|
| Latest release | ✅ |
| Older releases | ❌ |

We only support the latest release. Please update before reporting a vulnerability.

## Reporting a vulnerability

**Do not open a public issue for security vulnerabilities.**

Instead, please report them privately:

1. **Email**: Send details to the maintainer via GitHub's private contact (see profile of [flame3301](https://github.com/flame3301))
2. **GitHub Security Advisories**: Use the [Security tab](https://github.com/flame3301/QuietBrowse/security/advisories) to report privately

### What to include

- Description of the vulnerability
- Steps to reproduce
- Impact assessment
- Suggested fix (if you have one)

### What to expect

- **Acknowledgment** within 48 hours
- **Assessment** within 1 week
- **Fix or mitigation** as soon as practical
- **Credit** in the release notes (unless you prefer to remain anonymous)

## Security design

QuietBrowse is designed with privacy and security in mind:

- **No telemetry** — nothing is sent to any server
- **No accounts** — no authentication, no cloud sync
- **Local storage only** — all data stays on your machine
- **Context isolation** — renderer processes cannot access Node.js APIs directly
- **Sandboxed renderers** — web content runs in Chromium's sandbox
- **Content Security Policy** — strict CSP on all internal pages
- **Code-signed** — Windows binaries are signed via SignPath.io

## Dependencies

We keep dependencies minimal and audit them regularly. If you notice a dependency with a known vulnerability, please open an issue or PR.
