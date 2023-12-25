import { InstalledPackageInfo } from './installed-package';

export interface ProjectInfo {
  name: string;
  version: string;
  dependencies: InstalledPackageInfo[];
}

export interface DepDictionary {
  version: string;
  remoteVersions: string[];
  parentDependencies: {
    needs: string;
    name: string;
    version: string;
  }[];
}

export interface DependencyRemoteMeta {
  name: string;
  version: string;
  peerDependencies?: Record<string, string>;
  versions: string[];
}
