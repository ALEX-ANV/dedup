import { InstalledPackageInfo } from './installed-package';

export interface ProjectInfo {
  name: string;
  version: string;
  lock: LockFile;
  dependencies: InstalledPackageInfo[];
}

export interface DependencyEntity {
  version: string;
  name: string;
}

export interface LockFileDependency {
  version: string;
  resolved: string;
  integrity: string;
  requires?: {
    [name: string]: string;
  };
  dev?: boolean;
  dependencies?: { [name: string]: LockFileDependency };
}

export interface LockFile extends DependencyEntity {
  lockfileVersion: number;
  dependencies: {
    [name: string]: LockFileDependency;
  };
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
