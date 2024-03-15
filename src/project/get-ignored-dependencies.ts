import { join } from 'node:path';
import fs from 'node:fs/promises';
import { exists } from '../utils/exists-file';

const FILE_NAME = '.dedupignore';

export async function getIgnoredDependencies(
  dir: string
): Promise<Set<string>> {
  const ignoreConfigPath = join(dir, FILE_NAME);

  if (!(await exists(ignoreConfigPath))) {
    return new Set<string>();
  }
  const ignoreConfig = await fs.readFile(ignoreConfigPath, 'utf8');
  return new Set(ignoreConfig.split('\n').filter(Boolean));
}
