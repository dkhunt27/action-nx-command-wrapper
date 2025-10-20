import * as utils from './utilities.ts';
import * as gitUtils from './git-utilities.ts';
import { vi, type MockInstance } from 'vitest';
import { runNxAffected, runNxAll, runNxProjects } from './nx.ts';
import type { Inputs } from './types.ts';
import * as core from '@actions/core';

describe('nx tests', () => {
  let execPromisifiedMock: MockInstance;
  let retrieveGitBoundariesMock: MockInstance;
  let inputs: Inputs;

  beforeEach(() => {
    // silence logging
    vi.spyOn(core, 'info').mockImplementation(() => {});
    vi.spyOn(core, 'debug').mockImplementation(() => {});
    vi.spyOn(core, 'startGroup').mockImplementation(() => {});
    vi.spyOn(core, 'endGroup').mockImplementation(() => {});

    execPromisifiedMock = vi.spyOn(utils, 'execPromisified');
    retrieveGitBoundariesMock = vi.spyOn(gitUtils, 'retrieveGitBoundaries');

    retrieveGitBoundariesMock.mockResolvedValue({ base: 'base-sha', head: 'head-sha' });

    // Default inputs
    inputs = {
      affected: true,
      all: false,
      args: [],
      baseBoundaryOverride: '',
      headBoundaryOverride: '',
      isWorkflowsCiPipeline: false,
      parallel: 3,
      projects: [],
      setNxBranchToPrNumber: false,
      targets: [],
      workingDirectory: '',
    };
  });

  describe('runNxAll', () => {
    test('should inputs are all, should run as expected', async () => {
      execPromisifiedMock.mockResolvedValue('done');

      inputs.targets = ['build', 'test'];
      inputs.affected = false;
      inputs.all = true;

      await expect(runNxAll(inputs, [])).resolves.toBeUndefined();

      expect(execPromisifiedMock).toHaveBeenCalledTimes(2);
      expect(execPromisifiedMock).toHaveBeenNthCalledWith(1, 'npx nx run-many --target=build ');
      expect(execPromisifiedMock).toHaveBeenNthCalledWith(2, 'npx nx run-many --target=test ');
    });
  });

  describe('runNxAffected', () => {
    test('should inputs are affected, should run as expected', async () => {
      execPromisifiedMock.mockResolvedValue('done');

      inputs.targets = ['build', 'test'];
      inputs.affected = true;
      inputs.all = false;

      await expect(runNxAffected(inputs, [])).resolves.toBeUndefined();

      expect(execPromisifiedMock).toHaveBeenCalledTimes(2);
      expect(execPromisifiedMock).toHaveBeenNthCalledWith(1, 'npx nx affected --target=build --base=base-sha --head=head-sha ');
      expect(execPromisifiedMock).toHaveBeenNthCalledWith(2, 'npx nx affected --target=test --base=base-sha --head=head-sha ');
    });
  });

  describe('runNxProjects', () => {
    test('should inputs are projects, should run as expected', async () => {
      execPromisifiedMock.mockResolvedValue('done');

      inputs.targets = ['build', 'test'];
      inputs.affected = false;
      inputs.all = false;
      inputs.projects = ['project1', 'project2'];

      await expect(runNxProjects(inputs, [])).resolves.toBeUndefined();

      expect(execPromisifiedMock).toHaveBeenCalledTimes(2);
      expect(execPromisifiedMock).toHaveBeenNthCalledWith(1, 'npx nx run-many --target=build --projects=project1,project2 ');
      expect(execPromisifiedMock).toHaveBeenNthCalledWith(2, 'npx nx run-many --target=test --projects=project1,project2 ');
    });
  });
});
