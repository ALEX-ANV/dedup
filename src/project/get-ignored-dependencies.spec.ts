import { getIgnoredDependencies } from './get-ignored-dependencies';
import fs from 'node:fs/promises';

jest.mock('node:fs/promises', () => ({
  readFile: jest.fn(),
  access: jest.fn().mockResolvedValue(true),
}));

describe('getIgnoredDependencies', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should return a set of ignored dependencies', async () => {
    const dir = '/path/to/project';
    const expectedDependencies = new Set(['dependency1', 'dependency2']);

    // Mock the file system functions
    (fs.readFile as jest.Mock).mockResolvedValue('dependency1\ndependency2');

    const ignoredDependencies = await getIgnoredDependencies(dir);

    expect(ignoredDependencies).toEqual(expectedDependencies);
  });

  it('should return an empty set if .dedupignore file is empty', async () => {
    const dir = '/path/to/project';

    // Mock the file system functions
    (fs.readFile as jest.Mock).mockResolvedValue('');

    const ignoredDependencies = await getIgnoredDependencies(dir);

    expect(ignoredDependencies).toEqual(new Set());
  });

  it('should return an empty set if .dedupignore file does not exist', async () => {
    const dir = '/path/to/project';

    // Mock the file system functions
    (fs.access as jest.Mock).mockRejectedValue(false);

    const ignoredDependencies = await getIgnoredDependencies(dir);

    expect(ignoredDependencies).toEqual(new Set());
  });
});
