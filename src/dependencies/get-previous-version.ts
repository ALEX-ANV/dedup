import { parse, SemVer } from 'semver';
import { getVersionsInfoInRange } from './get-version-info-in-range';
import { formatSemver } from './get-formatted-semver-version';

export function getPreviousVersion(
  version: string,
  remoteVersions: string[],
  type: keyof Pick<SemVer, 'minor' | 'major' | 'patch'> = 'minor'
) {
  const parsedVersion = parse(version);

  if (!parsedVersion) {
    throw new Error(`Invalid version: ${version}`);
  }

  switch (type) {
    case 'minor':
      parsedVersion.patch = 0;
      break;
    case 'major':
      parsedVersion.minor = 0;
      parsedVersion.patch = 0;
      break;
    case 'patch':
      break;
  }

  return getVersionsInfoInRange(
    `<${formatSemver(parsedVersion)}`,
    remoteVersions
  ).max;
}
