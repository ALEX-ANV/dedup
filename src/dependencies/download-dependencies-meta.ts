import { DependencyRemoteMeta } from '../types/project-info';
import { InstalledPackageInfo } from '../types/installed-package';
import { Logger } from '../logger/logger-factory';
import { groupByCapacity } from '../utils/group-by-capacity';
import { getRemoteMeta } from './get-remote-dependency-meta';

const GROUP_CAPACITY = 10;
const DEPS_CACHE = new Map<string, DependencyRemoteMeta>();
export async function downloadDependenciesMeta(
  dependencies: InstalledPackageInfo[],
  logger: Logger
): Promise<Record<string, DependencyRemoteMeta>> {
  const groups = groupByCapacity(dependencies, GROUP_CAPACITY);

  return groups.reduce(
    (acc, group) =>
      acc.then((data) =>
        Promise.all(
          group.map(async (dependency) => {
            logger.next(`Fetching meta: ${dependency.name}`);

            const meta = await getCachedRemoteData(
              dependency.name,
              dependency.latest ? dependency.version : undefined
            );
            data[meta.name] = meta;
          })
        ).then(() => data)
      ),
    Promise.resolve({} as Record<string, DependencyRemoteMeta>)
  );
}

async function getCachedRemoteData(
  name: string,
  version: string | undefined
): Promise<DependencyRemoteMeta> {
  const key = getKey(name, version);
  if (DEPS_CACHE.has(key)) {
    return Promise.resolve(DEPS_CACHE.get(key));
  }
  const meta = await getRemoteMeta(name, version, [
    'peerDependencies',
    'versions',
  ]);

  DEPS_CACHE.set(key, meta);

  if (!version) {
    DEPS_CACHE.set(getKey(name, meta.version), meta);
  }

  return meta;
}

function getKey(name: string, version: string | undefined) {
  return `${name}@${version ?? 'latest'}`;
}
