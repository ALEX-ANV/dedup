import { VersionInfo } from '../types/version-info';
import { parse, Range, satisfies, SemVer } from 'semver';

export function getVersionsInfoInRange(
  range: string,
  versions: string[]
): VersionInfo {
  const parsedRange = new Range(range);

  const versionsInfo: VersionInfo = {
    min: parse(versions[versions.length - 1]) as SemVer,
    max: parse(versions[0]) as SemVer,
    versions: [],
  };

  if (!parsedRange) {
    throw new Error(`Invalid range: ${range}`);
  }

  return versions.reduce((acc, version) => {
    const parsedVersion = parse(version);

    if (!parsedVersion) {
      throw new Error(`Invalid version: ${version}`);
    }

    if (satisfies(version, parsedRange)) {
      acc.versions.push(parsedVersion);
      acc.max = parsedVersion.compare(acc.max) === 1 ? parsedVersion : acc.max;
      acc.min = parsedVersion.compare(acc.min) === -1 ? parsedVersion : acc.min;
    }

    return acc;
  }, versionsInfo);
}
