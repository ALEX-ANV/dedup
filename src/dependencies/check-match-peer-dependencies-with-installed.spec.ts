import { checkMatchingRootVersionWithPeerDependencies } from './check-match-peer-dependencies-with-installed';
import { DepDictionary } from '../types/project-info';
import { Logger } from '../logger/logger-factory';

describe(checkMatchingRootVersionWithPeerDependencies.name, () => {
  let dictionary: Record<string, DepDictionary>;

  const logger: Logger = {
    info: jest.fn(),
    warn: jest.fn(),
    next: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
    fail: jest.fn(),
    succeed: jest.fn(),
  };

  beforeEach(() => {
    dictionary = {
      'package-1': {
        remoteVersions: ['1.0.0', '1.1.0', '1.2.0', '2.0.0', '2.0.1'],
        version: '1.2.0',
        parentDependencies: [
          { name: 'package-1', version: '2.0.1', needs: '^2.0.0' },
        ],
      },
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return an array with updates if versions need to be updated', () => {
    const result = checkMatchingRootVersionWithPeerDependencies(
      dictionary,
      logger
    );
    expect(result).toEqual([{ name: 'package-1', needs: '1.2.0' }]);
  });

  it('should return an empty array if versions do not need to be updated', () => {
    dictionary['package-1'].parentDependencies[0].version = '1.2.0';
    dictionary['package-1'].parentDependencies[0].needs = '^1.0.0';

    const result = checkMatchingRootVersionWithPeerDependencies(
      dictionary,
      logger
    );
    expect(result).toEqual([]);
  });

  it('should handle packages without a version', () => {
    dictionary['package-1'].version = null;

    const result = checkMatchingRootVersionWithPeerDependencies(
      dictionary,
      logger
    );
    expect(result).toEqual([]);
  });

  it('should handle packages with an invalid version', () => {
    dictionary['package-1'].version = 'invalid';

    const result = checkMatchingRootVersionWithPeerDependencies(
      dictionary,
      logger
    );
    expect(result).toEqual([]);
  });
});
