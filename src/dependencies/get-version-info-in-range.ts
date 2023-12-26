import { VersionInfo } from '../types/version-info';
import { parse, Range, sort } from 'semver';

export function getVersionsInfoInRange(
  range: string,
  versions: string[]
): VersionInfo {
  const parsedRange = new Range(range);

  if (!parsedRange) {
    throw new Error(`Invalid range: ${range}`);
  }

  const satisfiedVersions = sort(
    versions.filter((version) => parsedRange.test(version))
  );

  return {
    min: parse(satisfiedVersions[0]),
    max: parse(satisfiedVersions[satisfiedVersions.length - 1]),
    versions: satisfiedVersions
      .map((version) => parse(version))
      .filter(Boolean),
  };
}
