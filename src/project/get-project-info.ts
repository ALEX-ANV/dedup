import { join } from 'node:path';
import { ProjectInfo } from '../types/project-info';
import { PackageJson } from '../types/package-json';
import { getIgnoredDependencies } from './get-ignored-dependencies';

export async function getProjectInfo(dir: string): Promise<ProjectInfo | null> {
  const load = (await import('load-json-file')).loadJsonFile;
  try {
    const packageJson = await load<PackageJson>(join(dir, 'package.json'));
    const ignoredDependencies = await getIgnoredDependencies(dir);

    const {
      dependencies = {},
      devDependencies = {},
      peerDependencies = {},
    } = packageJson;

    return {
      name: packageJson.name,
      version: packageJson.version,
      dependencies: Object.entries({
        ...dependencies,
        ...devDependencies,
        ...peerDependencies,
      })
        .filter(([name]) => !ignoredDependencies.has(name))
        .map(([name, version]) => ({
          name,
          version,
          latest: false,
        })),
    };
  } catch (err: unknown) {
    // eslint-disable-line
    if (err['code'] !== 'ENOENT') throw err;

    return null;
  }
}
