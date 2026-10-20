# Contributing to Reeling MCP

Start with a small reproducible issue or focused pull request. Useful contributions
include MCP client compatibility, transport fixes, documentation and runnable API
examples. The hosted Reeling app's customer data and private source do not belong here.

## Local checks

Use Node.js 22 or later:

```sh
npm ci
npm test
npm run check
npm pack --dry-run
```

Tests start a local stub API and exercise a real MCP stdio client. They never use
production credentials, publish content or request paid AI generation. Keep that
boundary in new tests. For API workflows, add examples to
[reeling-examples](https://github.com/yomariano/reeling-examples).

Describe the observed problem, expected behavior and checks in your PR. Never
include `.env`, keys, account identifiers or private request/response logs. See
[SECURITY.md](SECURITY.md) for vulnerability reporting.
