import { getProjectInfo } from './get-project-info';

describe(getProjectInfo.name, () => {
  const mockLoadJsonFile = jest.fn();
  jest.mock('load-json-file', () => ({
    loadJsonFile: mockLoadJsonFile,
  }));

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return project info if package.json exists', async () => {
    mockLoadJsonFile.mockResolvedValueOnce({
      name: 'test',
      version: '1.0.0',
      dependencies: { 'dep-1': '1.0.0' },
      devDependencies: { 'dev-dep-1': '1.0.0' },
      peerDependencies: { 'peer-dep-1': '1.0.0' },
    });

    const result = await getProjectInfo('/test/dir');

    expect(result).toEqual({
      name: 'test',
      version: '1.0.0',
      dependencies: [
        { name: 'dep-1', version: '1.0.0', latest: false },
        { name: 'dev-dep-1', version: '1.0.0', latest: false },
        { name: 'peer-dep-1', version: '1.0.0', latest: false },
      ],
    });
  });

  it('should return null if package.json does not exist', async () => {
    const error = new Error();
    error['code'] = 'ENOENT';
    mockLoadJsonFile.mockRejectedValueOnce(error);

    const result = await getProjectInfo('/test/dir');

    expect(result).toBeNull();
  });

  it('should throw error if error code is not ENOENT', async () => {
    const error = new Error();
    error['code'] = 'ERROR';
    mockLoadJsonFile.mockRejectedValueOnce(error);

    await expect(getProjectInfo('/test/dir')).rejects.toThrow(error);
  });
});