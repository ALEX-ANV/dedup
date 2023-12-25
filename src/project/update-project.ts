import { promises as fs } from 'node:fs';
import { InstalledPackageInfo } from '../types/installed-package';
import { PackageJson } from '../types/package-json';

export async function updatePackageJson(
  dir: string,
  dependencies: InstalledPackageInfo[]
) {
  const packageJsonPath = `${dir}/package.json`;

  const packageJson = JSON.parse(
    await fs.readFile(packageJsonPath, { encoding: 'utf8' })
  ) as PackageJson;

  packageJson.dependencies = dependencies.reduce((acc, { name, version }) => {
    if (name in acc) {
      acc[name] = version;
    }
    return acc;
  }, packageJson.dependencies || {});

  packageJson.devDependencies = dependencies.reduce(
    (acc, { name, version }) => {
      if (name in acc) {
        acc[name] = version;
      }
      return acc;
    },
    packageJson.devDependencies || {}
  );

  await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
}
