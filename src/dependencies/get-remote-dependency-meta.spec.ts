import { execute, OutputStream } from '../utils/execute';
import { getRemoteMeta } from './get-remote-dependency-meta';

jest.mock('../utils/execute');

describe(getRemoteMeta.name, () => {
  it('should correctly execute npm view command with version', async () => {
    const mockExecute = execute as jest.MockedFunction<typeof execute>;
    mockExecute.mockResolvedValueOnce(JSON.stringify({ version: '1.2.3' }));

    const result = await getRemoteMeta('test-dependency', '1.2.3', [
      'peerDependencies',
      'versions',
    ]);

    expect(mockExecute).toHaveBeenCalledWith(
      'npm',
      [
        'view',
        'test-dependency@1.2.3',
        'version',
        'name',
        'peerDependencies',
        'versions',
        '--json',
      ],
      OutputStream.PIPE
    );
    expect(result).toEqual({ version: '1.2.3' });
  });

  it('should correctly execute npm view command', async () => {
    const mockExecute = execute as jest.MockedFunction<typeof execute>;
    mockExecute.mockResolvedValueOnce(JSON.stringify({ version: '1.2.3' }));

    const result = await getRemoteMeta('test-dependency', 'latest', [
      'peerDependencies',
      'versions',
    ]);

    expect(mockExecute).toHaveBeenCalledWith(
      'npm',
      [
        'view',
        'test-dependency@latest',
        'version',
        'name',
        'peerDependencies',
        'versions',
        '--json',
      ],
      OutputStream.PIPE
    );
    expect(result).toEqual({ version: '1.2.3' });
  });

  it('should correctly handle JSON parsing error', () => {
    const mockExecute = execute as jest.MockedFunction<typeof execute>;
    mockExecute.mockResolvedValueOnce('invalid json');

    expect(getRemoteMeta('test-dependency')).resolves.toEqual({
      version: 'latest',
      name: 'test-dependency',
    });
  });

  it('should correctly handle error', async () => {
    const mockExecute = execute as jest.MockedFunction<typeof execute>;
    mockExecute.mockRejectedValueOnce(new Error('test error'));

    await expect(getRemoteMeta('test-dependency')).resolves.toEqual({
      version: 'latest',
      name: 'test-dependency',
    });
  });
});
