import * as core from '@actions/core';
import type { NxCommandInputs } from './types.ts';

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

export const validateInputs = (inputs: NxCommandInputs): void => {
  core.info('Validating inputs...');

  switch (inputs.command) {
    // biome-ignore lint/suspicious: will fall through intentionally because we want to run the targeted logic too
    case 'targetedProjects': {
      if (inputs.projects.length === 0) {
        throw new Error(`Projects cannot be empty when command is ${inputs.command}.`);
      }
    }
    case 'targetedAll':
    case 'targetedAffected':
      if (inputs.targets.length === 0) {
        throw new Error(`Targets cannot be empty when command is ${inputs.command}.`);
      }
      break;
    case 'showAffectedList':
      if (inputs.projects.length > 0) {
        throw new Error(`Projects must be empty when command is ${inputs.command}.`);
      }
      break;
    default:
      throw new Error(`Invalid command: ${inputs.command}`);
  }

  core.info('Inputs are valid.');
};
