import * as core from '@actions/core';
import type { PullRequest } from '@octokit/webhooks-types';
import * as github from '@actions/github';

import type { Inputs } from './types.ts';
import { runNxAffected, runNxAll, runNxProjects } from './nx.ts';

export const validateInputs = (inputs: Inputs): void => {
  core.info('Validating inputs...');

  const hasAll = inputs.all;
  const hasAffected = inputs.affected;
  const hasProjects = inputs.projects.length > 0;

  if (!hasAffected && !hasAll && !hasProjects) {
    throw new Error('Must have all, affected, or projects listed.');
  }

  if (hasProjects && (hasAffected || hasAll)) {
    throw new Error('Cannot have projects listed and affected or all true.');
  }

  if (hasAffected && (hasAll || hasProjects)) {
    throw new Error('Cannot have affected true and all true or projects listed.');
  }

  if (hasAll && (hasAffected || hasProjects)) {
    throw new Error('Cannot have all true and affected true or projects listed.');
  }

  core.info('Inputs are valid.');
};

export const runNx = async (inputs: Inputs): Promise<void> => {
  const args = inputs.args as string[];

  validateInputs(inputs);

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
