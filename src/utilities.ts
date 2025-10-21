import * as core from '@actions/core';
import type { Inputs } from './types.ts';

const util = require('node:util');
const exec = util.promisify(require('node:child_process').exec);

export const execPromisified = async (command: string, execOverride?: typeof exec): Promise<string> => {
  execOverride = execOverride ?? exec;
  const { stdout, stderr } = await execOverride(command);
  if (stderr) {
    throw stderr;
  }
  return stdout;
};

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
