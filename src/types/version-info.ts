import type { SemVer } from 'semver';

export interface VersionInfo {
  min: SemVer;
  max: SemVer;
  versions: SemVer[];
}
