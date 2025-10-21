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
        command: 'targetedAffected',
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
      { command: 'targetedProjects', projects: ['projA'] },
      { command: 'targetedAll', projects: [] },
      { command: 'targetedAffected', projects: [] },
    ])('should return valid when command: %s', async ({ command, projects }) => {
      inputs.command = command as never;
      inputs.projects = projects;

      expect(validateInputs(inputs)).toBeUndefined();
    });

    test('Should throw an error when invalid command', () => {
      inputs.command = 'invalidCommand' as never;

      expect(() => validateInputs(inputs)).toThrowError(`Invalid command`);
    });
  });
});
