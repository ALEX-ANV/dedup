import { VersionInfo } from '../types/version-info';
import { parse, Range, satisfies } from 'semver';

export function getVersionsInfoInRange(
  range: string,
  versions: string[]
): VersionInfo {
  const parsedRange = new Range(range);
  const set = parsedRange.set[0];
  const min = set[set.length - 1].semver;
  const max = set[0].semver;

  const versionsInfo: VersionInfo = {
    min,
    max,
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

    if (satisfies(parsedVersion, parsedRange)) {
      acc.versions.push(parsedVersion);
      const maxCompare = parsedVersion.compare(acc.max);
      const minCompare = parsedVersion.compare(acc.min);
      acc.max = maxCompare === 1 ? parsedVersion : acc.max;
      acc.min = minCompare === -1 ? parsedVersion : acc.min;
    }

    return acc;
  }, versionsInfo);
}
