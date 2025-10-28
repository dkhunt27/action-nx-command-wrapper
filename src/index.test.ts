import * as core from '@actions/core';
import type { MockInstance } from 'vitest';
import { runNx } from './index.ts';
import * as nx from './nx.ts';
import type { NxCommandInputs } from './types.ts';
import * as utils from './utilities.ts';

vi.mock('@actions/github', () => {
  return {
    context: {
      eventName: 'pull_request',
      payload: {
        pull_request: {
          number: 27,
        },
      },
    },
  };
});

describe('nx command (index) tests', () => {
  let inputs: NxCommandInputs;
  let runManyListedTargetsAndAllProjectsMock: MockInstance;
  let runManyListedTargetsAndListedProjectsMock: MockInstance;
  let runManyListedTargetsAndAffectedProjectsMock: MockInstance;
  let runShowNxAffectedListMock: MockInstance;

  beforeEach(() => {
    // silence logging
    vi.spyOn(core, 'info').mockImplementation(() => {});
    vi.spyOn(core, 'debug').mockImplementation(() => {});
    vi.spyOn(core, 'startGroup').mockImplementation(() => {});
    vi.spyOn(core, 'endGroup').mockImplementation(() => {});

    runManyListedTargetsAndAllProjectsMock = vi.spyOn(nx, 'runManyListedTargetsAndAllProjects').mockResolvedValue(undefined);
    runManyListedTargetsAndListedProjectsMock = vi
      .spyOn(nx, 'runManyListedTargetsAndListedProjects')
      .mockResolvedValue(undefined);
    runManyListedTargetsAndAffectedProjectsMock = vi
      .spyOn(nx, 'runManyListedTargetsAndAffectedProjects')
      .mockResolvedValue(undefined);
    runShowNxAffectedListMock = vi.spyOn(nx, 'runShowNxAffectedList').mockResolvedValue(['projA', 'projB']);

    // mark all inputs as valid
    vi.spyOn(utils, 'validateInputs').mockReturnValue();

    // Default inputs
    inputs = {
      command: 'runManyListedTargetsAndAffectedProjects',
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
    let origEnv: Record<string, string | undefined>;
    beforeEach(() => {
      origEnv = process.env;
    });

    afterEach(() => {
      process.env = origEnv;
    });

    test.each([
      {
        command: 'runManyListedTargetsAndListedProjects',
        projects: ['projA'],
        expected: undefined,
        runTargetedNxAll: 0,
        runTargetedNxProjects: 1,
        runTargetedNxAffected: 0,
        runShowNxAffectedList: 0,
      },
      {
        command: 'runManyListedTargetsAndAllProjects',
        projects: [],
        expected: undefined,
        runTargetedNxAll: 1,
        runTargetedNxProjects: 0,
        runTargetedNxAffected: 0,
        runShowNxAffectedList: 0,
      },
      {
        command: 'runManyListedTargetsAndAffectedProjects',
        projects: [],
        expected: undefined,
        runTargetedNxAll: 0,
        runTargetedNxProjects: 0,
        runTargetedNxAffected: 1,
        runShowNxAffectedList: 0,
      },
      {
        command: 'showAffectedList',
        projects: [],
        expected: ['projA', 'projB'],
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
        expected,
        runTargetedNxAll,
        runTargetedNxProjects,
        runTargetedNxAffected,
        runShowNxAffectedList,
      }) => {
        inputs.command = command as never;
        inputs.projects = projects;

        await expect(runNx(inputs)).resolves.toEqual(expected);

        expect(runManyListedTargetsAndAllProjectsMock).toHaveBeenCalledTimes(runTargetedNxAll);
        expect(runManyListedTargetsAndListedProjectsMock).toHaveBeenCalledTimes(runTargetedNxProjects);
        expect(runManyListedTargetsAndAffectedProjectsMock).toHaveBeenCalledTimes(runTargetedNxAffected);
        expect(runShowNxAffectedListMock).toHaveBeenCalledTimes(runShowNxAffectedList);
      },
    );

    test('should throw error when invalidCommand found', async () => {
      inputs.command = 'invalidCommand' as never;
      inputs.projects = [];

      await expect(runNx(inputs)).rejects.toThrow('Invalid command');

      expect(runManyListedTargetsAndAllProjectsMock).toHaveBeenCalledTimes(0);
      expect(runManyListedTargetsAndListedProjectsMock).toHaveBeenCalledTimes(0);
      expect(runManyListedTargetsAndAffectedProjectsMock).toHaveBeenCalledTimes(0);
    });

    test('should not set env var when setNxBranchToPrNumber = false', async () => {
      inputs.setNxBranchToPrNumber = false;

      await expect(runNx(inputs)).resolves.toBeUndefined();

      expect(process.env.NX_BRANCH).toBeUndefined();
      expect(runManyListedTargetsAndAllProjectsMock).toHaveBeenCalledTimes(0);
      expect(runManyListedTargetsAndListedProjectsMock).toHaveBeenCalledTimes(0);
      expect(runManyListedTargetsAndAffectedProjectsMock).toHaveBeenCalledTimes(1);
    });
    test('should set env var when setNxBranchToPrNumber = true', async () => {
      inputs.setNxBranchToPrNumber = true;

      await expect(runNx(inputs)).resolves.toBeUndefined();

      expect(process.env.NX_BRANCH).toBe('27');
      expect(runManyListedTargetsAndAllProjectsMock).toHaveBeenCalledTimes(0);
      expect(runManyListedTargetsAndListedProjectsMock).toHaveBeenCalledTimes(0);
      expect(runManyListedTargetsAndAffectedProjectsMock).toHaveBeenCalledTimes(1);
    });
  });
});
