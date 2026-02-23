import * as core from '@actions/core';
import { type MockInstance, vi } from 'vitest';
import * as gitUtils from './git-utilities.ts';
import {
  runManyListedTargetsAndAffectedProjects,
  runManyListedTargetsAndAllProjects,
  runManyListedTargetsAndListedProjects,
  runShowNxAffectedList,
} from './nx.ts';
import type { NxCommandInputs } from './types.ts';
import * as utils from './utilities.ts';

describe('nx tests', () => {
  let executeCommandMock: MockInstance;
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
    executeCommandMock = vi.spyOn(utils, 'executeCommand');
    retrieveGitBoundariesMock = vi.spyOn(gitUtils, 'retrieveGitBoundaries');

    retrieveGitBoundariesMock.mockResolvedValue({
      base: 'base-sha',
      head: 'head-sha',
    });

    // Default inputs
    inputs = {
      command: 'runManyListedTargetsAndAffectedProjects',
      affectedToIgnore: [],
      args: [],
      baseBoundaryOverride: '',
      headBoundaryOverride: '',
      isWorkflowsCiPipeline: false,
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
    test('when command is runManyListedTargetsAndAllProjects, should run as expected', async () => {
      executeCommandMock.mockResolvedValue('done');

      inputs.targets = ['build', 'test'];
      inputs.command = 'runManyListedTargetsAndAllProjects';

      await expect(runManyListedTargetsAndAllProjects(inputs, [])).resolves.toBeUndefined();

      expect(executeCommandMock).toHaveBeenCalledTimes(2);
      expect(executeCommandMock).toHaveBeenNthCalledWith(1, {
        command: 'npx --yes nx run-many --target=build ',
      });
      expect(executeCommandMock).toHaveBeenNthCalledWith(2, {
        command: 'npx --yes nx run-many --target=test ',
      });
    });
  });

  describe('runNxAffected', () => {
    test('when command is runManyListedTargetsAndAffectedProjects, should run as expected', async () => {
      executeCommandMock.mockResolvedValue('done');

      inputs.targets = ['build', 'test'];
      inputs.command = 'runManyListedTargetsAndAffectedProjects';

      await expect(runManyListedTargetsAndAffectedProjects(inputs, [])).resolves.toBeUndefined();

      expect(executeCommandMock).toHaveBeenCalledTimes(2);
      expect(executeCommandMock).toHaveBeenNthCalledWith(1, {
        command: 'npx --yes nx affected --target=build --base=base-sha --head=head-sha ',
      });
      expect(executeCommandMock).toHaveBeenNthCalledWith(2, {
        command: 'npx --yes nx affected --target=test --base=base-sha --head=head-sha ',
      });
    });
  });

  describe('runNxProjects', () => {
    test('when command is runManyListedTargetsAndListedProjects, should run as expected', async () => {
      executeCommandMock.mockResolvedValue('done');

      inputs.targets = ['build', 'test'];
      inputs.command = 'runManyListedTargetsAndListedProjects';
      inputs.projects = ['project1', 'project2'];

      await expect(runManyListedTargetsAndListedProjects(inputs, [])).resolves.toBeUndefined();

      expect(executeCommandMock).toHaveBeenCalledTimes(2);
      expect(executeCommandMock).toHaveBeenNthCalledWith(1, {
        command: 'npx --yes nx run-many --target=build --projects=project1,project2 ',
      });
      expect(executeCommandMock).toHaveBeenNthCalledWith(2, {
        command: 'npx --yes nx run-many --target=test --projects=project1,project2 ',
      });
    });
  });

  describe('runShowNxAffectedList', () => {
    test('when command is showAffectedList, should run as expected', async () => {
      executeCommandMock.mockResolvedValue(['project1', 'project2']);

      inputs.targets = ['build', 'test'];
      inputs.command = 'showAffectedList';
      inputs.projects = [];

      await expect(runShowNxAffectedList(inputs, [])).resolves.toEqual(['project1', 'project2']);

      expect(executeCommandMock).toHaveBeenCalledTimes(1);
      expect(executeCommandMock).toHaveBeenCalledWith({
        command: 'npx --yes nx show projects --affected --base=base-sha --head=head-sha --withTarget=build,test',
      });
      expect(coreOutputMock).toHaveBeenCalledWith('affected', ['project1', 'project2']);
      expect(coreOutputMock).toHaveBeenCalledWith('hasAffected', true);
    });
  });
});
