import * as core from '@actions/core';
import { vi } from 'vitest';
import type { NxCommandInputs } from './types';
import { executeCommand, validateInputs } from './utilities';

describe('utilities tests', () => {
  beforeEach(() => {
    // silence logging
    vi.spyOn(core, 'info').mockImplementation(() => {});
    vi.spyOn(core, 'debug').mockImplementation(() => {});
    vi.spyOn(core, 'startGroup').mockImplementation(() => {});
    vi.spyOn(core, 'endGroup').mockImplementation(() => {});

    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T12:00:00Z'));
  });

  afterEach(() => {
    vi.resetAllMocks();
    vi.useRealTimers();
  });

  describe('executeCommand', async () => {
    test('when commands succeeds, should resolve', async () => {
      await expect(executeCommand({ command: 'echo "Tue Oct 28 15:23:31 EDT 2025"' })).resolves.toEqual([
        'Tue',
        'Oct',
        '28',
        '15:23:31',
        'EDT',
        '2025',
      ]);
    });
    test('when command fails, should reject', async () => {
      await expect(executeCommand({ command: `node -e "throw new Error('fail')"` })).rejects.toThrow();
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
