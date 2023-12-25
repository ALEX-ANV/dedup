import { DependencyRemoteMeta } from '../types/project-info';
import { InstalledPackageInfo } from '../types/installed-package';
import { Logger } from '../logger/logger-factory';
export declare function downloadDependenciesMeta(dependencies: InstalledPackageInfo[], logger: Logger): Promise<Record<string, DependencyRemoteMeta>>;
