import { parse, SemVer } from 'semver';
import { getVersionsInfoInRange } from './get-version-info-in-range';
import { formatSemver } from './get-formatted-semver-version';

export function getPreviousVersion(
  dep: { needs: string; name: string; version: string },
  remoteVersions: string[],
  type: keyof Pick<SemVer, 'minor' | 'major' | 'patch'> = 'minor'
) {
  const version = parse(dep.version);

  if (!version) {
    throw new Error(`Invalid version: ${dep.version}`);
  }

  switch (type) {
    case 'minor':
      version.patch = 0;
      break;
    case 'major':
      version.minor = 0;
      version.patch = 0;
      break;
    case 'patch':
      version.patch = Math.max(version.patch - 1, 0);
      break;
  }

  return getVersionsInfoInRange(`<${formatSemver(version)}`, remoteVersions)
    .max;
}
