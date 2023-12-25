import { SemVer } from 'semver';
export declare function getPreviousVersion(dep: {
    needs: string;
    name: string;
    version: string;
}, remoteVersions: string[], type?: keyof Pick<SemVer, 'minor' | 'major' | 'patch'>): SemVer;
