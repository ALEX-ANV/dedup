import { execute, OutputStream } from '../utils/execute';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getRemoteMeta<T = any>(
  dependency: string,
  version = 'latest'
): Promise<T> {
  return execute(
    `npm`,
    [
      'view',
      `${dependency}@${version}`,
      `peerDependencies`,
      `version`,
      `name`,
      'versions',
      `--json`,
    ],
    OutputStream.PIPE
  ).then((output) => JSON.parse(output) as T);
}
