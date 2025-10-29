<h1 align="center" style="text-align: center; width: fit-content; margin-left: auto; margin-right: auto;">action-nx-command-wrapper</h1>

<p align="center">
  <a href="https://github.com/dkhunt27/action-nx-command-wrapper/actions">CI</a>
  ·
  <a href="https://github.com/dkhunt27/action-nx-command-wrapper/releases">Releases</a>
  ·
  <a href="https://github.com/dkhunt27/action-nx-command-wrapper/issues">Issues</a>
</p>

<span align="center">

</span>

Nx command wrapper for @dkhunt27/action-nx-command



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
import { runNx, type NxCommandInputs } from "action-nx-command-wrapper";

const inputs: NxCommandInputs = {
      command: 'targetedAffected',
      affectedToIgnore: [],
      args: [],
      baseBoundaryOverride: '',
      headBoundaryOverride: '',
      isWorkflowsCiPipeline: false,
      projects: [],
      setNxBranchToPrNumber: false,
      targets: [],
      workingDirectory: '',
    };

await runNx(inputs);
```

## Releasing

- Merge the automated Release PR created by Release Please
- Manually run the "Release" workflow to publish to npm and JSR with provenance

## Template

Started with [ts-base](https://github.com/bgub/ts-base)