import { DepDictionary, DependencyRemoteMeta } from '../types/project-info';
import { formatSemver } from './get-formatted-semver-version';
import { InstalledPackageInfo } from '../types/installed-package';
import { Logger } from '../logger/logger-factory';
import { downloadDependenciesMeta } from './download-dependencies-meta';
import { checkMatchingRootVersionWithPeerDependencies } from './check-match-peer-dependencies-with-installed';
import { groupBy } from '../utils/group-by-capacity';
import { getVersionsInfoInRange } from './get-version-info-in-range';

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
  const notMatchedDependencies =
    checkMatchingRootVersionWithPeerDependencies(dictionary);

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

    if (versions.length === 1) {
      dep.version = formatSemver(
        getVersionsInfoInRange(versions[0], deps[packageName]?.versions ?? [])
          .max
      );
      dep.latest = true;
      logger.next(`Installing: ${packageName}@${dep.version}`);
      continue;
    }

    const versionToInstall = versions
      .map((version) => {
        return getVersionsInfoInRange(
          version,
          deps[packageName]?.versions ?? []
        );
      })
      .reduce((acc, item) => {
        if (item.min.compare(acc.min) === 1) {
          acc.min = item.min;
        }

        if (item.max.compare(acc.max) === -1) {
          acc.max = item.max;
        }

        acc.versions = acc.versions.filter((version) =>
          item.versions.some((it) => it.compare(version) === 0)
        );

        return acc;
      });

    dep.version = formatSemver(versionToInstall.max);
    dep.latest = true;
    logger.next(`Installing: ${packageName}@${dep.version}`);
  }

  await alignDependencies(dependencies, logger, step + 1);
}
