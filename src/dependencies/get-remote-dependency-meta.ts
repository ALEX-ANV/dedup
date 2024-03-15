import { execute, OutputStream } from '../utils/execute';
import { PackageJson } from '../types/package-json';
import { DependencyEntity } from '../types/project-info';

type RemotePackageJson = PackageJson & { versions: string[] };

type Fields = Exclude<keyof RemotePackageJson, 'name' | 'version'>;

type Additional<T extends Fields[]> = {
  [P in T[number]]: RemotePackageJson[P];
};

export async function getRemoteMeta<T extends Fields[]>(
  dependency: string,
  version = 'latest',
  additionalArgs: T = [] as T
): Promise<DependencyEntity & Additional<T>> {
  return execute(
    `npm`,
    [
      'view',
      `${dependency}@${version}`,
      // `peerDependencies`,
      `version`,
      `name`,
      // 'versions',
      ...additionalArgs,
      `--json`,
    ],
    OutputStream.PIPE
  )
    .then((output) => JSON.parse(output) as DependencyEntity & Additional<T>)
    .catch((err) => {
      console.error(err);
      return {
        version,
        name: dependency,
      } as DependencyEntity & Additional<T>;
    });
}
