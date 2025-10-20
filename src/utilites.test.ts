import { vi, type MockInstance } from 'vitest';
import * as core from '@actions/core';
import { execPromisified } from './utilities';

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
      execPromisifiedMock.mockResolvedValue({ stdout: 'stdout', stderr: undefined });
      await expect(execPromisified('some command', execPromisifiedMock)).resolves.toBe('stdout');
    });
    test('when exec returns stderr, should resolve', async () => {
      execPromisifiedMock.mockResolvedValue({ stdout: 'stdout', stderr: 'stderr' });
      await expect(execPromisified('some command', execPromisifiedMock)).rejects.toBe('stderr');
    });
  });
});
