import { retrieveGitBoundaries } from './git-utilities.ts';
import * as core from '@actions/core';
import * as utils from './utilities.ts';
import type { MockInstance } from 'vitest';

describe('git-utilities tests', () => {
  let execPromisifiedMock: MockInstance;

  beforeEach(() => {
    // silence logging
    vi.spyOn(core, 'info').mockImplementation(() => {});
    vi.spyOn(core, 'debug').mockImplementation(() => {});
    vi.spyOn(core, 'startGroup').mockImplementation(() => {});
    vi.spyOn(utils, 'execPromisified');

    execPromisifiedMock = vi.spyOn(utils, 'execPromisified').mockImplementation((ref) => {
      if (ref.indexOf('HEAD~1') > -1) return Promise.resolve('base-sha');
      if (ref.indexOf('HEAD') > -1) return Promise.resolve('head-sha');
      return Promise.reject('unknown ref');
    });
  });
  describe('retrieveGitBoundaries', () => {
    test('when pull request, should use the pr shas', async () => {
      await expect(
        retrieveGitBoundaries({
          inputs: {} as never,
          githubContextEventName: 'pull_request',
          githubContextPayload: {
            pull_request: {
              base: { sha: 'base-sha-pr' },
              head: { sha: 'head-sha-pr' },
            } as never,
          },
        })
      ).resolves.toEqual({ base: 'base-sha-pr', head: 'head-sha-pr' });
    });
    test('when push event, should use the push event', async () => {
      await expect(
        retrieveGitBoundaries({
          inputs: {} as never,
          githubContextEventName: 'push',
          githubContextPayload: {
            before: 'before-sha-push',
            after: 'after-sha-push',
          },
        })
      ).resolves.toEqual({ base: 'before-sha-push', head: 'after-sha-push' });
    });
    test('when push event and overrides, should use overrides', async () => {
      await expect(
        retrieveGitBoundaries({
          inputs: {
            baseBoundaryOverride: 'override-base-sha',
            headBoundaryOverride: 'override-head-sha',
          } as never,
          githubContextEventName: 'push',
          githubContextPayload: {
            before: 'before-sha-push',
            after: 'after-sha-push',
          },
        })
      ).resolves.toEqual({
        base: 'override-base-sha',
        head: 'override-head-sha',
      });
    });
    test('when not pull request or push event and overrides, should use overrides', async () => {
      await expect(
        retrieveGitBoundaries({
          inputs: {
            baseBoundaryOverride: 'override-base-sha',
            headBoundaryOverride: 'override-head-sha',
          } as never,
          githubContextEventName: 'other',
          githubContextPayload: {
            before: 'before-sha',
            after: 'after-sha',
          },
        })
      ).resolves.toEqual({ base: 'override-base-sha', head: 'override-head-sha' });
    });
    test('when not pull request or push event, should use git reverse parse', async () => {
      await expect(
        retrieveGitBoundaries({
          inputs: {} as never,
          githubContextEventName: 'other',
          githubContextPayload: {
            before: 'before-sha',
            after: 'after-sha',
          },
        })
      ).resolves.toEqual({ base: 'base-sha', head: 'head-sha' });
    });
  });
});
