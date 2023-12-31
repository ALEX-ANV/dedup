import { alignDependencies } from './dependencies/align-dependencies';
import { createLoggerAsync } from './logger/logger-factory';
import { getProjectInfo } from './project/get-project-info';
import { updatePackageJson } from './project/update-project';

async function main() {
  const logger = await createLoggerAsync();
  const dir = process.argv[2] || process.cwd();

  try {
    const projectLogger = logger.start('Getting project info...');
    const projectInfo = await getProjectInfo(dir);
    projectLogger.succeed('Project info loaded');

    if (!projectInfo) {
      logger.fail('No project found');
      process.exit(1);
    }

    const depLogger = logger.start('Aligning dependencies...');
    await alignDependencies(projectInfo.dependencies, depLogger);
    depLogger.succeed('Dependencies aligned');

    const updLogger = logger.start('Updating package.json...');
    await updatePackageJson(dir, projectInfo.dependencies);
    updLogger.succeed(`Done! 🎉 🎉 🎉 Please run install command!`);
  } catch (err: unknown) {
    if (err instanceof Error) {
      logger.fail(err.message);
    }

    process.exit(1);
  }
}

main();
