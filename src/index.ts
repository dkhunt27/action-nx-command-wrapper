import * as core from '@actions/core';
import * as github from '@actions/github';
import type { PullRequest } from '@octokit/webhooks-types';
import { runShowNxAffectedList, runTargetedNxAffected, runTargetedNxAll, runTargetedNxProjects } from './nx.ts';
import type { NxCommandInputs } from './types.ts';
import * as utils from './utilities.ts';

export const runNx = async (inputs: NxCommandInputs): Promise<string[] | undefined> => {
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

  switch (inputs.command) {
    case 'targetedAll':
      return runTargetedNxAll(inputs, args);
    case 'targetedProjects':
      return runTargetedNxProjects(inputs, args);
    case 'targetedAffected':
      return runTargetedNxAffected(inputs, args);
    case 'showAffectedList':
      return runShowNxAffectedList(inputs, args);
    default:
      throw new Error(`Invalid command: ${inputs.command}`);
  }
};

export type { NxCommandInputs } from './types.ts';
