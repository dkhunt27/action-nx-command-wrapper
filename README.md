<h1 align="center" style="text-align: center; width: fit-content; margin-left: auto; margin-right: auto;">ts-base</h1>

<p align="center">
  <a href="https://github.com/dkhunt27/action-nx-command-wrapper/actions">CI</a>
  ·
  <a href="https://github.com/dkhunt27/action-nx-command-wrapper/releases">Releases</a>
  ·
  <a href="https://github.com/dkhunt27/action-nx-command-wrapper/issues">Issues</a>
</p>

<span align="center">

</span>

TypeScript library starter that works out-of-the-box with Node, Deno, Bun, and the browser. Batteries included: linting, testing, bundling, size-limit, and automated releases.

## Features

- **Biome**: lint and format with a single tool
- **Vitest**: fast tests with coverage and thresholds
- **Size Limit**: keep bundles tiny, with CI checks
- **tsdown**: ESM builds for Node and a separate browser bundle
- **CI**: lint, typecheck, test, coverage, and size comments/badges
- **Release Please**: automated release PRs and changelogs
- **Commit Linting**: conventional commits enforced in CI
- **Deno-friendly**: `.ts` source imports for direct consumption
- **Multi-runtime**: `src/internal.ts` is runtime-agnostic; `src/index.ts` (Node) and `src/browser.ts` (browser) wire runtime-specific APIs
- **OIDC + Provenance**: publish to npm and JSR via manual CI release

## Usage

Install dependencies and run scripts:

```bash
# first setup node using nodeenv; not necessary if already have node v20+ installed
brew install nodeenv
nodeenv .node

npm install
npm run lint
npm run  test
npm run  build
```

Node usage:

```ts
import { add, greet, getSecureRandomId } from "@bgub/ts-base";

console.log(add(2, 3));
console.log(greet("Ada"));
console.log(getSecureRandomId());
```

## Releasing

- Merge the automated Release PR created by Release Please
- Manually run the "Release" workflow to publish to npm and JSR with provenance

## Template

Started with [ts-base](https://github.com/bgub/ts-base)