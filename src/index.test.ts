import * as core from '@actions/core';
import type { MockInstance } from 'vitest';
import { runNx, validateInputs } from './index.ts';
import * as nx from './nx.ts';
import type { Inputs } from './types.ts';

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

  describe('validateInputs', () => {
    test.each([
      { affected: false, all: false, projects: ['projA'] },
      { affected: false, all: true, projects: [] },
      { affected: true, all: false, projects: [] },
    ])('should return valid when affected: %s all: %s projects: %s', async ({ affected, all, projects }) => {
      inputs.affected = affected;
      inputs.all = all;
      inputs.projects = projects;

      await expect(validateInputs(inputs)).toBeUndefined();
    });

    test.each([
      // cant all be true
      {
        affected: true,
        all: true,
        projects: ['projA'],
        error: 'Cannot have projects listed and affected or all true.',
      },
      // cant have projects and affected/all
      {
        affected: true,
        all: false,
        projects: ['projA'],
        error: 'Cannot have projects listed and affected or all true.',
      },
      {
        affected: false,
        all: true,
        projects: ['projA'],
        error: 'Cannot have projects listed and affected or all true.',
      },
      // cant have all and projects/affected
      {
        affected: false,
        all: true,
        projects: ['projA'],
        error: 'Cannot have projects listed and affected or all true.',
      },
      {
        affected: true,
        all: true,
        projects: [],
        error: 'Cannot have affected true and all true or projects listed.',
      },
      // cant have affected and projects/affected
      {
        affected: true,
        all: false,
        projects: ['projA'],
        error: 'Cannot have projects listed and affected or all true.',
      },
      {
        affected: true,
        all: true,
        projects: [],
        error: 'Cannot have affected true and all true or projects listed.',
      },
      // cant all be false
      {
        affected: false,
        all: false,
        projects: [],
        error: 'Must have all, affected, or projects listed.',
      },
    ])('Should throw an error when affected: %s %s', async ({ affected, all, projects, error }) => {
      inputs.affected = affected;
      inputs.all = all;
      inputs.projects = projects;

      await expect(() => validateInputs(inputs)).toThrowError(error);
    });
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

    test.each([
      // cant all be true
      { affected: true, all: true, projects: ['projA'] },
      // cant have projects and affected/all
      { affected: true, all: false, projects: ['projA'] },
      { affected: false, all: true, projects: ['projA'] },
      // cant have all and projects/affected
      { affected: false, all: true, projects: ['projA'] },
      { affected: true, all: true, projects: [] },
      // cant have affected and projects/affected
      { affected: true, all: false, projects: ['projA'] },
      { affected: true, all: true, projects: [''] },
    ])('Should throw an error when affected: %s %s', async ({ affected, all, projects }) => {
      inputs.affected = affected;
      inputs.all = all;
      inputs.projects = projects;

      await expect(() => validateInputs(inputs)).toThrow();
    });
  });
});
