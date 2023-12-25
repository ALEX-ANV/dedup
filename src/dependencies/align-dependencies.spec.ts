import { alignDependencies } from './align-dependencies';
import { InstalledPackageInfo } from '../types/installed-package';
import { Logger } from '../logger/logger-factory';

jest.mock('./download-dependencies-meta', () => ({
  downloadDependenciesMeta: jest.fn().mockImplementation(() => {
    return Promise.resolve({
      package1: {
        name: 'package1',
        version: '10.0.0',
        peerDependencies: {},
        versions: [],
      },
      package2: {
        name: 'package2',
        version: '10.0.0',
        peerDependencies: {},
        versions: [],
      },
      package3: {
        name: 'package3',
        version: '10.0.0',
        peerDependencies: {},
        versions: [],
      },
    });
  }),
}));

describe('alignDependencies', () => {
  let dependencies: InstalledPackageInfo[];
  let logger: Logger;

  beforeEach(() => {
    dependencies = [
      { name: 'package1', version: '1.0.0', latest: false },
      { name: 'package2', version: '2.0.0', latest: false },
      { name: 'package3', version: '3.0.0', latest: false },
    ];
    logger = {
      info: jest.fn(),
      warn: jest.fn(),
      next: jest.fn(),
      start: jest.fn(),
      stop: jest.fn(),
      fail: jest.fn(),
      succeed: jest.fn(),
    };
  });

  it('should return the dependencies with the latest version', async () => {
    // Arrange

    // Act
    await alignDependencies(dependencies, logger);

    // Assert
    expect(dependencies).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'package1',
          version: '10.0.0',
        }),
        expect.objectContaining({
          name: 'package2',
          version: '10.0.0',
        }),
        expect.objectContaining({
          name: 'package3',
          version: '10.0.0',
        }),
      ])
    );
  });
});
