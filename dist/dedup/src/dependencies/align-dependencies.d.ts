import { InstalledPackageInfo } from '../types/installed-package';
import { Logger } from '../logger/logger-factory';
export declare function alignDependencies(dependencies: InstalledPackageInfo[], logger: Logger, step?: number): Promise<void>;
