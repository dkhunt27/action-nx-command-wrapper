import * as core from '@actions/core';
import { type MockInstance, vi } from 'vitest';
import type { NxCommandInputs } from './types';
import { execPromisified, validateInputs } from './utilities';

describe('utilities tests', () => {
  let execPromisifiedMock: MockInstance;

  beforeEach(() => {
    // silence logging
    vi.spyOn(core, 'info').mockImplementation(() => {});
    vi.spyOn(core, 'debug').mockImplementation(() => {});
    vi.spyOn(core, 'startGroup').mockImplementation(() => {});
    vi.spyOn(core, 'endGroup').mockImplementation(() => {});

    execPromisifiedMock = vi.fn();
  });

  describe('execPromisified', async () => {
    test('when exec returns stdout, should resolve', async () => {
      execPromisifiedMock.mockResolvedValue({
        stdout: 'stdout\n',
        stderr: undefined,
      });
      await expect(execPromisified('some command', execPromisifiedMock)).resolves.toEqual(['stdout']);
    });
    test('when exec returns stderr, should resolve', async () => {
      execPromisifiedMock.mockResolvedValue({
        stdout: 'stdout\n',
        stderr: 'stderr',
      });
      await expect(execPromisified('some command', execPromisifiedMock)).rejects.toBe('stderr');
    });
  });

  describe('validateInputs', () => {
    let inputs: NxCommandInputs;

    beforeEach(() => {
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
        targets: ['build'],
        workingDirectory: '',
      };
    });
    test.each([
      { command: 'runManyListedTargetsAndListedProjects', projects: ['projA'] },
      { command: 'runManyListedTargetsAndAllProjects', projects: [] },
      { command: 'runManyListedTargetsAndAffectedProjects', projects: [] },
      { command: 'showAffectedList', projects: [] },
    ])('should return valid when command: %s', async ({ command, projects }) => {
      inputs.command = command as never;
      inputs.projects = projects;

      expect(validateInputs(inputs)).toBeUndefined();
    });

    test.each([
      { command: 'runManyListedTargetsAndListedProjects', projects: [], targets: [], error: 'Projects cannot be empty' },
      {
        command: 'runManyListedTargetsAndListedProjects',
        projects: ['projA'],
        targets: [],
        error: 'Targets cannot be empty',
      },
      { command: 'runManyListedTargetsAndAllProjects', projects: [], targets: [], error: 'Targets cannot be empty' },
      { command: 'runManyListedTargetsAndAffectedProjects', projects: [], targets: [], error: 'Targets cannot be empty' },
      { command: 'showAffectedList', projects: ['projA'], targets: [], error: 'Projects must be empty' },
    ])('Should throw an error when inputs are %s', ({ command, projects, targets, error }) => {
      inputs.command = command as never;
      inputs.projects = projects;
      inputs.targets = targets;

      expect(() => validateInputs(inputs)).toThrowError(error);
    });
  });
});
