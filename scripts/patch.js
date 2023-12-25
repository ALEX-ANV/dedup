const path = require('node:path');
const fs = require('node:fs');

function patchPackageJson() {
  const packageJsonPath = path.join('./dist', 'dedup', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

  packageJson.scripts = {};
  packageJson['types'] = './src/cli.d.ts';

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  fs.writeFileSync(packageJsonPath + '1', JSON.stringify(packageJson, null, 2));
}

patchPackageJson();
