import { createLoggerAsync, Logger } from './logger/logger-factory';
import { getProjectInfo } from './project/get-project-info';
import { formatSemver } from './dependencies/get-formatted-semver-version';
import { InstalledPackageInfo } from './types/installed-package';
import { DepDictionary, DependencyRemoteMeta } from './types/project-info';
import { groupBy, groupByCapacity } from './utils/group-by-capacity';
import { getRemoteMeta } from './dependencies/get-remote-dependency-meta';
import { parse, satisfies, valid, validRange } from 'semver';
import { getVersionsInfoInRange } from './dependencies/get-version-info-in-range';
import { getPreviousVersion } from './dependencies/get-previous-version';
import { updatePackageJson } from './project/update-project';

async function downloadLatestMeta(
  dependencies: InstalledPackageInfo[],
  logger: Logger
): Promise<Record<string, DependencyRemoteMeta>> {
  const groupCapacity = 10;

  const groups = groupByCapacity(dependencies, groupCapacity);

  return groups.reduce(
    (acc, group) =>
      acc.then((data) =>
        Promise.all(
          group.map((dependency) => {
            logger.next(`Fetching latest meta: ${dependency.name}`);

            return getRemoteMeta(
              dependency.name,
              dependency.latest ? dependency.version : undefined
            ).then((meta) => {
              data[meta.name] = meta;
            });
          })
        ).then(() => data)
      ),
    Promise.resolve({} as Record<string, DependencyRemoteMeta>)
  );
}

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
function checkMatchingRootVersionWithPeerDependencies(
  dictionary: Record<string, DepDictionary>
) {
  const packages = Object.entries(dictionary);

  const updates: {
    name: string;
    needs: string;
  }[] = [];

  for (const [
    name,
    { remoteVersions: versions, version, parentDependencies },
  ] of packages) {
    if (versions.length === 1) {
      continue;
    }

    if (!version) {
      continue;
    }

    const rootVersion = parse(version);

    if (!rootVersion) {
      continue;
    }

    for (const dep of parentDependencies) {
      if (validRange(dep.needs)) {
        if (!satisfies(rootVersion, dep.needs)) {
          const dependencyInfo = getVersionsInfoInRange(dep.needs, versions);

          console.log(
            `Not matched version for dependency ${name}@${version} with version ${dep.needs} for package ${dep.name}@${dep.version}`
          );

          if (dependencyInfo.min.compare(rootVersion) !== 1) {
            updates.push({
              name,
              needs: dep.needs,
            });
          } else {
            const previousVersion = getPreviousVersion(
              dep,
              dictionary[dep.name].remoteVersions,
              'minor'
            );

            updates.push({
              name: dep.name,
              needs: formatSemver(previousVersion),
            });
          }
        }
      } else if (valid(dep.needs)) {
        if (rootVersion.compare(dep.needs) !== 0) {
          console.log(
            `Not matched version for dependency ${name}@${version} with version ${dep.needs} for package ${dep.name}@${dep.version}`
          );

          updates.push({
            name,
            needs: dep.needs,
          });
        }
      } else {
        console.log(`Unknown version for dependency ${name}: ${dep.needs}`);
      }
    }
  }

  return updates;
}
async function alignDependencies(
  dependencies: InstalledPackageInfo[],
  logger: Logger,
  step = 1
) {
  logger.next(`Step ${step}`);

  const deps = await downloadLatestMeta(dependencies, logger);

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

async function main() {
  const logger = await createLoggerAsync();
  const dir = process.argv[2] || process.cwd();

  try {
    const projectLogger = logger.start('Getting project info...');
    const projectInfo = await getProjectInfo(dir);
    projectLogger.succeed('Project info loaded');

    if (!projectInfo) {
      logger.fail('No project found');
      process.exit(1);
    }

    const depLogger = logger.start('Aligning dependencies...');
    await alignDependencies(projectInfo.dependencies, depLogger);
    depLogger.succeed('Dependencies aligned');

    const updLogger = logger.start('Updating package.json...');
    await updatePackageJson(dir, projectInfo.dependencies);
    updLogger.succeed(`Done! 🎉 🎉 🎉 Please run install command!`);
  } catch (err: unknown) {
    if (err instanceof Error) {
      logger.fail(err.message);
    }

    process.exit(1);
  }
}

main();
