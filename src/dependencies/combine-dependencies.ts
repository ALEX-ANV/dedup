import { InstalledPackageInfo } from '../types/installed-package';

export function combineDependencies(
  dependencies: Record<string, string> = {},
  devDependencies: Record<string, string> = {},
  peerDependencies: Record<string, string> = {}
): InstalledPackageInfo[] {
  return [
    ...(Object.entries(dependencies).map(([name, version]) => ({
      name,
      version,
      latest: false,
      dep: true,
    })) as InstalledPackageInfo[]),
    ...(Object.entries(devDependencies).map(([name, version]) => ({
      name,
      version,
      latest: false,
      dev: true,
    })) as InstalledPackageInfo[]),
    ...(Object.entries(peerDependencies).map(([name, version]) => ({
      name,
      version,
      latest: false,
      peer: true,
    })) as InstalledPackageInfo[]),
  ];
}
