import * as core from '@actions/core';
import type { MockInstance } from 'vitest';
import { runNx } from './index.ts';
import * as nx from './nx.ts';
import type { NxCommandInputs } from './types.ts';
import * as utils from './utilities.ts';

describe('nx command (index) tests', () => {
  let inputs: NxCommandInputs;
  let runTargetedNxAllMock: MockInstance;
  let runTargetedNxProjectsMock: MockInstance;
  let runTargetedNxAffectedMock: MockInstance;
  let runShowNxAffectedListMock: MockInstance;

  beforeEach(() => {
    // silence logging
    vi.spyOn(core, 'info').mockImplementation(() => {});
    vi.spyOn(core, 'debug').mockImplementation(() => {});
    vi.spyOn(core, 'startGroup').mockImplementation(() => {});
    vi.spyOn(core, 'endGroup').mockImplementation(() => {});

    runTargetedNxAllMock = vi.spyOn(nx, 'runTargetedNxAll').mockResolvedValue(undefined);
    runTargetedNxProjectsMock = vi.spyOn(nx, 'runTargetedNxProjects').mockResolvedValue(undefined);
    runTargetedNxAffectedMock = vi.spyOn(nx, 'runTargetedNxAffected').mockResolvedValue(undefined);
    runShowNxAffectedListMock = vi.spyOn(nx, 'runShowNxAffectedList').mockResolvedValue([]);

    // mark all inputs as valid
    vi.spyOn(utils, 'validateInputs').mockReturnValue();

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

  describe('runNx', () => {
    test.each([
      {
        command: 'targetedProjects',
        projects: ['projA'],
        runTargetedNxAll: 0,
        runTargetedNxProjects: 1,
        runTargetedNxAffected: 0,
        runShowNxAffectedList: 0,
      },
      {
        command: 'targetedAll',
        projects: [],
        runTargetedNxAll: 1,
        runTargetedNxProjects: 0,
        runTargetedNxAffected: 0,
        runShowNxAffectedList: 0,
      },
      {
        command: 'targetedAffected',
        projects: [],
        runTargetedNxAll: 0,
        runTargetedNxProjects: 0,
        runTargetedNxAffected: 1,
        runShowNxAffectedList: 0,
      },
      {
        command: 'showAffectedList',
        projects: [],
        runTargetedNxAll: 0,
        runTargetedNxProjects: 0,
        runTargetedNxAffected: 0,
        runShowNxAffectedList: 1,
      },
    ])(
      'should run expected runNx when command: %s',
      async ({
        command,
        projects,
        runTargetedNxAll,
        runTargetedNxProjects,
        runTargetedNxAffected,
        runShowNxAffectedList,
      }) => {
        inputs.command = command as never;
        inputs.projects = projects;

        await runNx(inputs);

        expect(runTargetedNxAllMock).toHaveBeenCalledTimes(runTargetedNxAll);
        expect(runTargetedNxProjectsMock).toHaveBeenCalledTimes(runTargetedNxProjects);
        expect(runTargetedNxAffectedMock).toHaveBeenCalledTimes(runTargetedNxAffected);
        expect(runShowNxAffectedListMock).toHaveBeenCalledTimes(runShowNxAffectedList);
      },
    );

    test('should throw error when invalidCommand found', async () => {
      inputs.command = 'invalidCommand' as never;
      inputs.projects = [];

      await expect(runNx(inputs)).rejects.toThrow('Invalid command');

      expect(runTargetedNxAllMock).toHaveBeenCalledTimes(0);
      expect(runTargetedNxProjectsMock).toHaveBeenCalledTimes(0);
      expect(runTargetedNxAffectedMock).toHaveBeenCalledTimes(0);
    });
  });
});
