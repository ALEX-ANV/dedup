import { SemVer } from 'semver';

export function formatSemver(version: SemVer): string {
  return `${version.major}.${version.minor}.${version.patch}`;
}
