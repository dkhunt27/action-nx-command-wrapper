import * as core from '@actions/core';
import * as github from '@actions/github';
import * as gitUtils from './git-utilities.ts';
import type { NxCommandInputs } from './types';
import { execPromisified } from './utilities.ts';

export const runTargetedNxAll = async (inputs: NxCommandInputs, args: string[]): Promise<undefined> => {
  core.startGroup('Running NX All');

  const promises = [];
  core.info('Running nx targets...');
  for (const target of inputs.targets) {
    core.info(`Target: ${target}`);

    const cmd = `npx nx run-many --target=${target} ${args.join(' ')}`;

    core.info(`running command: ${cmd}`);

    promises.push(execPromisified(cmd));
  }

  await Promise.all(promises);

  core.endGroup();
};

export const runTargetedNxProjects = async (inputs: NxCommandInputs, args: string[]): Promise<undefined> => {
  core.startGroup('Running NX Projects');

  const promises = [];
  core.info('Running nx targets...');
  for (const target of inputs.targets) {
    core.info(`Target: ${target}`);

    const cmd = `npx nx run-many --target=${target} --projects=${inputs.projects.join(',')} ${args.join(' ')}`;

    core.info(`running command: ${cmd}`);

    promises.push(execPromisified(cmd));
  }

  await Promise.all(promises);

  core.endGroup();
};

export const runTargetedNxAffected = async (inputs: NxCommandInputs, args: string[]): Promise<undefined> => {
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

    const cmd = `npx nx affected --target=${target} --base=${base} --head=${head} ${args.join(' ')}`;

    core.info(`running command: ${cmd}`);

    promises.push(execPromisified(cmd));
  }

  await Promise.all(promises);

  core.endGroup();
};

export const runShowNxAffectedList = async (inputs: NxCommandInputs, args: string[]): Promise<string[]> => {
  core.startGroup('Running NX Show Affected List');

  core.info('Retrieving git boundaries...');
  const { base, head } = await gitUtils.retrieveGitBoundaries({
    inputs,
    githubContextEventName: github.context.eventName,
    githubContextPayload: github.context.payload,
  });

  core.info(`Base boundary: ${base}`);
  core.info(`Head boundary: ${head}`);

  if (inputs.targets.length > 0) {
    core.info(`Using targets: ${inputs.targets.join(',')}`);
    args.push(`--withTarget=${inputs.targets.join(',')}`);
  }

  const cmd = `npx nx show projects --affected --base=${base} --head=${head} ${args.join(' ')}`;

  core.info(`running command: ${cmd}`);

  const results = await execPromisified(cmd);

  const affected = results
    .split(/\s+/) // split on any whitespace including newlines
    .map((x) => x.trim())
    .filter((x) => !inputs.affectedToIgnore.includes(x))
    .filter((x) => x.length > 0);

  core.info(`Affected Project List: ${affected}`);

  core.setOutput('affected', affected);

  core.setOutput('hasAffected', affected.length > 0);

  core.endGroup();

  return affected;
};
