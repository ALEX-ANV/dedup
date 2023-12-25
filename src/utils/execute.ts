import { spawn, SpawnOptions } from 'node:child_process';

export const enum OutputStream {
  HIDE,
  PIPE,
}

export function execute(
  command: string,
  args: string[],
  outputStream: OutputStream = OutputStream.HIDE
): Promise<string> {
  const spawnOptions: SpawnOptions = {
    shell: true,
    env: {
      ...process.env,
    },
    stdio:
      outputStream === OutputStream.HIDE
        ? ['ignore', 'ignore', 'pipe']
        : 'pipe',
  };
  return new Promise((res, rej) => {
    const output: string[] = [];
    const error: string[] = [];

    const childProcess = spawn(command, args, spawnOptions).on(
      'close',
      (code) => {
        if (code === 0) {
          res(output.join(''));
        } else {
          rej(error.join(''));
        }
      }
    );

    childProcess.stdout?.on('data', (data) => {
      output.push(data.toString());
    });

    childProcess.stderr?.on('data', (data) => {
      error.push(data.toString());
    });

    childProcess.on('error', (err) => {
      rej(JSON.stringify(err));
    });
  });
}
