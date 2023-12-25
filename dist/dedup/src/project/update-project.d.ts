import { InstalledPackageInfo } from '../types/installed-package';
export declare function updatePackageJson(dir: string, dependencies: InstalledPackageInfo[]): Promise<void>;
