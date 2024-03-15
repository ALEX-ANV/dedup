import { join } from 'node:path';
import { LockFile, ProjectInfo } from '../types/project-info';
import { PackageJson } from '../types/package-json';
import { getIgnoredDependencies } from './get-ignored-dependencies';
import { combineDependencies } from '../dependencies/combine-dependencies';
import { exists } from '../utils/exists-file';

export async function getProjectInfo(dir: string): Promise<ProjectInfo | null> {
  const load = (await import('load-json-file')).loadJsonFile;
  try {
    const packageJson = await load<PackageJson>(join(dir, 'package.json'));
    const ignoredDependencies = await getIgnoredDependencies(dir);

    if (!(await exists(join(dir, 'package-lock.json')))) {
      throw new Error('package-lock.json not found. Supported only npm.');
    }
    const packageLockJson = await load<LockFile>(
      join(dir, 'package-lock.json')
    );
    const { dependencies, devDependencies, peerDependencies } = packageJson;

    return {
      name: packageJson.name,
      version: packageJson.version,
      lock: packageLockJson,
      dependencies: combineDependencies(
        dependencies,
        devDependencies,
        peerDependencies
      ).filter(({ name }) => !ignoredDependencies.has(name)),
    };
  } catch (err: unknown) {
    // eslint-disable-line
    if (err['code'] !== 'ENOENT') throw err;

    return null;
  }
}
