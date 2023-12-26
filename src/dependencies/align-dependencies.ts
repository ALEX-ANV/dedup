import { DepDictionary, DependencyRemoteMeta } from '../types/project-info';
import { formatSemver } from './get-formatted-semver-version';
import { InstalledPackageInfo } from '../types/installed-package';
import { Logger } from '../logger/logger-factory';
import { downloadDependenciesMeta } from './download-dependencies-meta';
import { checkMatchingRootVersionWithPeerDependencies } from './check-match-peer-dependencies-with-installed';
import { groupBy } from '../utils/group-by-capacity';
import { getVersionsInfoInRange } from './get-version-info-in-range';
import { sort } from 'semver';

function makeDictionary(dependencies: Record<string, DependencyRemoteMeta>) {
  const data: Record<string, DepDictionary> = {};

  for (const [name, meta] of Object.entries(dependencies)) {
    if (!data[name]) {
      data[name] = {
        version: '',
        remoteVersions: [],
        parentDependencies: [],
      };
    }

    data[name].version = meta.version;
    data[name].remoteVersions = meta.versions;

    if (meta.peerDependencies) {
      for (const [dep, version] of Object.entries(meta.peerDependencies)) {
        if (!data[dep]) {
          data[dep] = {
            version: '',
            remoteVersions: [],
            parentDependencies: [],
          };
        }

        data[dep].parentDependencies.push({
          needs: version,
          name,
          version: meta.version,
        });
      }
    }
  }

  return data;
}

export async function alignDependencies(
  dependencies: InstalledPackageInfo[],
  logger: Logger,
  step = 1
) {
  logger.next(`Step ${step}`);

  const deps = await downloadDependenciesMeta(dependencies, logger);

  Object.entries(deps).forEach(([name, meta]) => {
    dependencies.find((dep) => dep.name === name)!.version = meta.version;
  });

  const dictionary = makeDictionary(deps);
  const notMatchedDependencies = checkMatchingRootVersionWithPeerDependencies(
    dictionary,
    logger
  );

  if (!notMatchedDependencies.length) {
    return;
  }

  const groupedDependencies = groupBy(notMatchedDependencies, (item) => {
    return [item.name, item.needs];
  });

  for (const [packageName, versions] of Object.entries(groupedDependencies)) {
    const dep = dependencies.find(({ name }) => name === packageName);

    if (!dep) {
      throw new Error(`Dependency ${packageName} not found`);
    }

    const sortedMaxVersions = sort(
      versions.map(
        (version) =>
          getVersionsInfoInRange(version, deps[packageName]?.versions ?? []).max
      )
    );

    dep.version = formatSemver(sortedMaxVersions[0]);
    dep.latest = true;
    logger.next(`Installing: ${packageName}@${dep.version}`);
  }

  await alignDependencies(dependencies, logger, step + 1);
}
