import * as core from '@actions/core';
import { type MockInstance, vi } from 'vitest';
import * as gitUtils from './git-utilities.ts';
import { runShowNxAffectedList, runTargetedNxAffected, runTargetedNxAll, runTargetedNxProjects } from './nx.ts';
import type { NxCommandInputs } from './types.ts';
import * as utils from './utilities.ts';

describe('nx tests', () => {
  let execPromisifiedMock: MockInstance;
  let retrieveGitBoundariesMock: MockInstance;
  let coreOutputMock: MockInstance;
  let inputs: NxCommandInputs;

  beforeEach(() => {
    // silence logging
    vi.spyOn(core, 'info').mockImplementation(() => {});
    vi.spyOn(core, 'debug').mockImplementation(() => {});
    vi.spyOn(core, 'startGroup').mockImplementation(() => {});
    vi.spyOn(core, 'endGroup').mockImplementation(() => {});

    coreOutputMock = vi.spyOn(core, 'setOutput').mockImplementation(() => {});
    execPromisifiedMock = vi.spyOn(utils, 'execPromisified');
    retrieveGitBoundariesMock = vi.spyOn(gitUtils, 'retrieveGitBoundaries');

    retrieveGitBoundariesMock.mockResolvedValue({
      base: 'base-sha',
      head: 'head-sha',
    });

    // Default inputs
    inputs = {
      command: 'targetedAffected',
      affectedToIgnore: [],
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

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('runNxAll', () => {
    test('when command is targetedAll, should run as expected', async () => {
      execPromisifiedMock.mockResolvedValue('done');

      inputs.targets = ['build', 'test'];
      inputs.command = 'targetedAll';

      await expect(runTargetedNxAll(inputs, [])).resolves.toBeUndefined();

      expect(execPromisifiedMock).toHaveBeenCalledTimes(2);
      expect(execPromisifiedMock).toHaveBeenNthCalledWith(1, 'npx nx run-many --target=build ');
      expect(execPromisifiedMock).toHaveBeenNthCalledWith(2, 'npx nx run-many --target=test ');
    });
  });

  describe('runNxAffected', () => {
    test('when command is targetedAffected, should run as expected', async () => {
      execPromisifiedMock.mockResolvedValue('done');

      inputs.targets = ['build', 'test'];
      inputs.command = 'targetedAffected';

      await expect(runTargetedNxAffected(inputs, [])).resolves.toBeUndefined();

      expect(execPromisifiedMock).toHaveBeenCalledTimes(2);
      expect(execPromisifiedMock).toHaveBeenNthCalledWith(
        1,
        'npx nx affected --target=build --base=base-sha --head=head-sha ',
      );
      expect(execPromisifiedMock).toHaveBeenNthCalledWith(
        2,
        'npx nx affected --target=test --base=base-sha --head=head-sha ',
      );
    });
  });

  describe('runNxProjects', () => {
    test('when command is targetedProjects, should run as expected', async () => {
      execPromisifiedMock.mockResolvedValue('done');

      inputs.targets = ['build', 'test'];
      inputs.command = 'targetedProjects';
      inputs.projects = ['project1', 'project2'];

      await expect(runTargetedNxProjects(inputs, [])).resolves.toBeUndefined();

      expect(execPromisifiedMock).toHaveBeenCalledTimes(2);
      expect(execPromisifiedMock).toHaveBeenNthCalledWith(1, 'npx nx run-many --target=build --projects=project1,project2 ');
      expect(execPromisifiedMock).toHaveBeenNthCalledWith(2, 'npx nx run-many --target=test --projects=project1,project2 ');
    });
  });

  describe('runShowNxAffectedList', () => {
    test('when command is showAffectedList, should run as expected', async () => {
      execPromisifiedMock.mockResolvedValue('project1\nproject2');

      inputs.targets = ['build', 'test'];
      inputs.command = 'showAffectedList';
      inputs.projects = [];

      await expect(runShowNxAffectedList(inputs, [])).resolves.toEqual(['project1', 'project2']);

      expect(execPromisifiedMock).toHaveBeenCalledTimes(1);
      expect(execPromisifiedMock).toHaveBeenCalledWith(
        'npx nx show projects --affected --base=base-sha --head=head-sha --withTarget=build,test',
      );
      expect(coreOutputMock).toHaveBeenCalledWith('affected', ['project1', 'project2']);
      expect(coreOutputMock).toHaveBeenCalledWith('hasAffected', true);
    });
  });
});
