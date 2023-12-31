import { parse, satisfies, valid, validRange } from 'semver';
import { DepDictionary } from '../types/project-info';
import { getVersionsInfoInRange } from './get-version-info-in-range';
import { getPreviousVersion } from './get-previous-version';
import { formatSemver } from './get-formatted-semver-version';
import { Logger } from '../logger/logger-factory';

export function checkMatchingRootVersionWithPeerDependencies(
  dictionary: Record<string, DepDictionary>,
  logger: Logger
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

          logger.next(
            `Not matched version for dependency ${name}@${version} with version ${dep.needs} for package ${dep.name}@${dep.version}`
          );

          if (dependencyInfo.min.compare(rootVersion) !== 1) {
            updates.push({
              name,
              needs: dep.needs,
            });
          } else {
            const previousVersion = getPreviousVersion(
              dep.version,
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
          logger.next(
            `Not matched version for dependency ${name}@${version} with version ${dep.needs} for package ${dep.name}@${dep.version}`
          );

          updates.push({
            name,
            needs: dep.needs,
          });
        }
      } else {
        logger.warn(`Unknown version for dependency ${name}: ${dep.needs}`);
      }
    }
  }

  return updates;
}
