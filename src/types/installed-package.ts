import { DependencyEntity } from './project-info';

export interface InstalledPackageInfo extends DependencyEntity {
  latest: boolean;
}
