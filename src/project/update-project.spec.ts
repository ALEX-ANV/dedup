import { updatePackageJson } from './update-project';

xdescribe(updatePackageJson.name, () => {
  const mockFs = {
    readFile: jest.fn(),
    writeFile: jest.fn(),
  };

  jest.mock('node:fs', () => ({
    promises: mockFs,
  }));

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should correctly update dependencies in package.json', async () => {
    mockFs.readFile.mockResolvedValueOnce(
      JSON.stringify({
        dependencies: { 'dep-1': '1.0.0' },
        devDependencies: { 'dev-dep-1': '1.0.0' },
      })
    );

    const dependencies = [
      { name: 'dep-1', version: '1.1.0', latest: true },
      { name: 'dev-dep-1', version: '1.1.0', latest: true },
    ];

    await updatePackageJson('/test/dir', dependencies);

    expect(mockFs.readFile).toHaveBeenCalledWith('/test/dir/package.json', {
      encoding: 'utf8',
    });
    expect(mockFs.writeFile).toHaveBeenCalledWith(
      '/test/dir/package.json',
      JSON.stringify(
        {
          dependencies: { 'dep-1': '1.1.0' },
          devDependencies: { 'dev-dep-1': '1.1.0' },
        },
        null,
        2
      )
    );
  });

  it('should not update dependencies not present in package.json', async () => {
    mockFs.readFile.mockResolvedValueOnce(
      JSON.stringify({
        dependencies: { 'dep-1': '1.0.0' },
        devDependencies: { 'dev-dep-1': '1.0.0' },
      })
    );

    const dependencies = [
      { name: 'dep-2', version: '1.1.0', latest: true },
      { name: 'dev-dep-2', version: '1.1.0', latest: true },
    ];

    await updatePackageJson('/test/dir', dependencies);

    expect(mockFs.readFile).toHaveBeenCalledWith('/test/dir/package.json', {
      encoding: 'utf8',
    });
    expect(mockFs.writeFile).toHaveBeenCalledWith(
      '/test/dir/package.json',
      JSON.stringify(
        {
          dependencies: { 'dep-1': '1.0.0' },
          devDependencies: { 'dev-dep-1': '1.0.0' },
        },
        null,
        2
      )
    );
  });

  it('should handle package.json without dependencies or devDependencies', async () => {
    mockFs.readFile.mockResolvedValueOnce(JSON.stringify({}));

    const dependencies = [
      { name: 'dep-1', version: '1.1.0', latest: true },
      { name: 'dev-dep-1', version: '1.1.0', latest: true },
    ];

    await updatePackageJson('/test/dir', dependencies);

    expect(mockFs.readFile).toHaveBeenCalledWith('/test/dir/package.json', {
      encoding: 'utf8',
    });
    expect(mockFs.writeFile).toHaveBeenCalledWith(
      '/test/dir/package.json',
      JSON.stringify({}, null, 2)
    );
  });
});
