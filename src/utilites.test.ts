import * as core from '@actions/core';
import { type MockInstance, vi } from 'vitest';
import type { Inputs } from './types';
import { execPromisified, validateInputs } from './utilities';

describe('nx tests', () => {
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
        stdout: 'stdout',
        stderr: undefined,
      });
      await expect(execPromisified('some command', execPromisifiedMock)).resolves.toBe('stdout');
    });
    test('when exec returns stderr, should resolve', async () => {
      execPromisifiedMock.mockResolvedValue({
        stdout: 'stdout',
        stderr: 'stderr',
      });
      await expect(execPromisified('some command', execPromisifiedMock)).rejects.toBe('stderr');
    });
  });

  describe('validateInputs', () => {
    let inputs: Inputs;

    beforeEach(() => {
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
    test.each([
      { affected: false, all: false, projects: ['projA'] },
      { affected: false, all: true, projects: [] },
      { affected: true, all: false, projects: [] },
    ])('should return valid when affected: %s all: %s projects: %s', async ({ affected, all, projects }) => {
      inputs.affected = affected;
      inputs.all = all;
      inputs.projects = projects;

      expect(validateInputs(inputs)).toBeUndefined();
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
    ])('Should throw an error when affected: %s %s', ({ affected, all, projects, error }) => {
      inputs.affected = affected;
      inputs.all = all;
      inputs.projects = projects;

      expect(() => validateInputs(inputs)).toThrowError(error);
    });
  });
});
