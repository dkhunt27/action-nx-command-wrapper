import * as core from '@actions/core';
import type { MockInstance } from 'vitest';
import { runNx } from './index.ts';
import * as nx from './nx.ts';
import type { Inputs } from './types.ts';
import * as utils from './utilities.ts';

describe('nx command (index) tests', () => {
  let inputs: Inputs;
  let runNxAllMock: MockInstance;
  let runNxProjectsMock: MockInstance;
  let runNxAffectedMock: MockInstance;

  beforeEach(() => {
    // silence logging
    vi.spyOn(core, 'info').mockImplementation(() => {});
    vi.spyOn(core, 'debug').mockImplementation(() => {});
    vi.spyOn(core, 'startGroup').mockImplementation(() => {});
    vi.spyOn(core, 'endGroup').mockImplementation(() => {});

    runNxAllMock = vi.spyOn(nx, 'runNxAll').mockResolvedValue();
    runNxProjectsMock = vi.spyOn(nx, 'runNxProjects').mockResolvedValue();
    runNxAffectedMock = vi.spyOn(nx, 'runNxAffected').mockResolvedValue();

    // mark all inputs as valid
    vi.spyOn(utils, 'validateInputs').mockReturnValue();

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

  describe('runNx', () => {
    test.each([
      {
        affected: false,
        all: false,
        projects: ['projA'],
        runNxAll: 0,
        runNxProjects: 1,
        runNxAffected: 0,
      },
      {
        affected: false,
        all: true,
        projects: [],
        runNxAll: 1,
        runNxProjects: 0,
        runNxAffected: 0,
      },
      {
        affected: true,
        all: false,
        projects: [],
        runNxAll: 0,
        runNxProjects: 0,
        runNxAffected: 1,
      },
    ])(
      'should run expected runNx when affected: %s all: %s projects: %s',
      async ({ affected, all, projects, runNxAll, runNxProjects, runNxAffected }) => {
        inputs.affected = affected;
        inputs.all = all;
        inputs.projects = projects;

        await runNx(inputs);

        expect(runNxAllMock).toHaveBeenCalledTimes(runNxAll);
        expect(runNxProjectsMock).toHaveBeenCalledTimes(runNxProjects);
        expect(runNxAffectedMock).toHaveBeenCalledTimes(runNxAffected);
      },
    );

    test('should throw error when no valid execution path found', async () => {
      inputs.affected = false;
      inputs.all = false;
      inputs.projects = [];

      await expect(runNx(inputs)).rejects.toThrow('No valid execution path found.');

      expect(runNxAllMock).toHaveBeenCalledTimes(0);
      expect(runNxProjectsMock).toHaveBeenCalledTimes(0);
      expect(runNxAffectedMock).toHaveBeenCalledTimes(0);
    });
  });
});
