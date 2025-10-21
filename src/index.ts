import * as core from '@actions/core';
import * as github from '@actions/github';
import type { PullRequest } from '@octokit/webhooks-types';
import { runNxAffected, runNxAll, runNxProjects } from './nx.ts';
import type { Inputs } from './types.ts';
import * as utils from './utilities.ts';

export const runNx = async (inputs: Inputs): Promise<void> => {
  const args = inputs.args as string[];

  utils.validateInputs(inputs);

  core.info(`args: ${args.join()}`);

  if (inputs.setNxBranchToPrNumber) {
    if (github.context.eventName === 'pull_request') {
      const prPayload = github.context.payload.pull_request as PullRequest;
      process.env.NX_BRANCH = prPayload.number.toString();
    }
  }

  if (inputs.parallel) {
    args.push(`--parallel=${inputs.parallel.toString()}`);
  }

  if (inputs.all === true) {
    return runNxAll(inputs, args);
  } else if (inputs.projects.length > 0) {
    return runNxProjects(inputs, args);
  } else if (inputs.affected === true) {
    return runNxAffected(inputs, args);
  } else {
    throw new Error('No valid execution path found.');
  }
};
