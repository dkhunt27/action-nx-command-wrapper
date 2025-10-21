import type * as github from '@actions/github';
import type { PullRequest, PushEvent } from '@octokit/webhooks-types';
import type { NxCommandInputs } from './types';
import { execPromisified } from './utilities';

export const retrieveGitBoundaries = async (params: {
  inputs: NxCommandInputs;
  githubContextEventName: string;
  githubContextPayload: typeof github.context.payload;
}): Promise<{ base: string; head: string }> => {
  const { inputs, githubContextEventName, githubContextPayload } = params;

  let base = '';
  let head = '';

  if (githubContextEventName === 'pull_request') {
    const prPayload = githubContextPayload.pull_request as PullRequest;
    base = prPayload.base.sha;
    head = prPayload.head.sha;
  } else if (githubContextEventName === 'push') {
    const pushPayload = githubContextPayload as PushEvent;
    base = inputs.baseBoundaryOverride || pushPayload.before;
    head = inputs.headBoundaryOverride || pushPayload.after;
  } else {
    if (inputs.baseBoundaryOverride) {
      base = inputs.baseBoundaryOverride;
    } else {
      base = await execPromisified('git rev-parse HEAD~1');
    }

    if (inputs.headBoundaryOverride) {
      head = inputs.headBoundaryOverride;
    } else {
      head = await execPromisified('git rev-parse HEAD');
    }
  }

  return { base, head };
};
