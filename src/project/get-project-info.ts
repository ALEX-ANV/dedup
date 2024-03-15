import path from 'node:path';
import { LockFile, ProjectInfo } from '../types/project-info';
import { PackageJson } from '../types/package-json';
import { getIgnoredDependencies } from './get-ignored-dependencies';
import { combineDependencies } from '../dependencies/combine-dependencies';
import { exists } from '../utils/exists-file';

export async function getProjectInfo(dir: string): Promise<ProjectInfo | null> {
  const load = (await import('load-json-file')).loadJsonFile;
  try {
    const packageJson = await load<PackageJson>(path.join(dir, 'package.json'));
    const packageLockPath = path.join(dir, 'package-lock.json');
    const ignoredDependencies = await getIgnoredDependencies(dir);

    if (!(await exists(packageLockPath))) {
      throw new Error('package-lock.json not found. Supported only npm.');
    }
    const packageLockJson = await load<LockFile>(packageLockPath);

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
