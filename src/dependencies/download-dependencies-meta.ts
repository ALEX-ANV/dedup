import { DependencyRemoteMeta } from '../types/project-info';
import { InstalledPackageInfo } from '../types/installed-package';
import { Logger } from '../logger/logger-factory';
import { groupByCapacity } from '../utils/group-by-capacity';
import { getRemoteMeta } from './get-remote-dependency-meta';

export async function downloadDependenciesMeta(
  dependencies: InstalledPackageInfo[],
  logger: Logger
): Promise<Record<string, DependencyRemoteMeta>> {
  const groupCapacity = 10;

  const groups = groupByCapacity(dependencies, groupCapacity);

  return groups.reduce(
    (acc, group) =>
      acc.then((data) =>
        Promise.all(
          group.map(async (dependency) => {
            logger.next(`Fetching latest meta: ${dependency.name}`);

            const meta = await getRemoteMeta(
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
