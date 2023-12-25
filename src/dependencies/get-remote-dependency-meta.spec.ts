import { execute, OutputStream } from '../utils/execute';
import { getRemoteMeta } from './get-remote-dependency-meta';

jest.mock('../utils/execute');

describe(getRemoteMeta.name, () => {
  it('should correctly execute npm view command with version', async () => {
    const mockExecute = execute as jest.MockedFunction<typeof execute>;
    mockExecute.mockResolvedValueOnce(JSON.stringify({ version: '1.2.3' }));

    const result = await getRemoteMeta('test-dependency', '1.2.3');

    expect(mockExecute).toHaveBeenCalledWith(
      'npm',
      [
        'view',
        'test-dependency@1.2.3',
        'peerDependencies',
        'version',
        'name',
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

    const result = await getRemoteMeta('test-dependency');

    expect(mockExecute).toHaveBeenCalledWith(
      'npm',
      [
        'view',
        'test-dependency@latest',
        'peerDependencies',
        'version',
        'name',
        'versions',
        '--json',
      ],
      OutputStream.PIPE
    );
    expect(result).toEqual({ version: '1.2.3' });
  });

  it('should correctly handle JSON parsing error', async () => {
    const mockExecute = execute as jest.MockedFunction<typeof execute>;
    mockExecute.mockResolvedValueOnce('invalid json');

    await expect(getRemoteMeta('test-dependency')).rejects.toThrow(SyntaxError);
  });

  it('should correctly handle error', async () => {
    const mockExecute = execute as jest.MockedFunction<typeof execute>;
    mockExecute.mockRejectedValueOnce(new Error('test error'));

    await expect(getRemoteMeta('test-dependency')).rejects.toThrow(
      'test error'
    );
  });
});
