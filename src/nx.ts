import * as core from '@actions/core';
import type { Inputs } from './types';
import * as github from '@actions/github';
import * as gitUtils from './git-utilities.ts';
import { execPromisified } from './utilities.ts';

export const runNxAll = async (inputs: Inputs, args: string[]): Promise<void> => {
  core.startGroup('Running NX All');

  const promises = [];
  core.info('Running nx targets...');
  for (const target of inputs.targets) {
    core.info(`Target: ${target}`);

    promises.push(execPromisified(`npx nx run-many --target=${target} ${args.join(' ')}`));
  }

  await Promise.all(promises);

  core.endGroup();
};

export const runNxProjects = async (inputs: Inputs, args: string[]): Promise<void> => {
  core.startGroup('Running NX Projects');

  const promises = [];
  core.info('Running nx targets...');
  for (const target of inputs.targets) {
    core.info(`Target: ${target}`);

    promises.push(execPromisified(`npx nx run-many --target=${target} --projects=${inputs.projects.join(',')} ${args.join(' ')}`));
  }

  await Promise.all(promises);

  core.endGroup();
};

export const runNxAffected = async (inputs: Inputs, args: string[]): Promise<void> => {
  core.startGroup('Running NX Affected');

  core.info('Retrieving git boundaries...');
  const { base, head } = await gitUtils.retrieveGitBoundaries({
    inputs,
    githubContextEventName: github.context.eventName,
    githubContextPayload: github.context.payload,
  });

  core.info(`Base boundary: ${base}`);
  core.info(`Head boundary: ${head}`);

  const promises = [];
  core.info('Running nx targets...');
  for (const target of inputs.targets) {
    core.info(`Target: ${target}`);

    promises.push(execPromisified(`npx nx affected --target=${target} --base=${base} --head=${head} ${args.join(' ')}`));
  }

  await Promise.all(promises);

  core.endGroup();
};
