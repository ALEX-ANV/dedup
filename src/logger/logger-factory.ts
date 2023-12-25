export interface Logger {
  start(message: string): Logger;
  next(message: string): void;
  succeed(message: string): void;
  fail(message: string): void;
  info(message: string): void;
  warn(message: string): void;
  stop(): void;
}

function factory(instance: import('ora').Ora): Logger {
  return {
    start(message: string): Logger {
      return factory(instance.start(message));
    },
    next(message: string): void {
      instance.text = message;
    },
    succeed(message: string): void {
      instance.succeed(message);
    },
    fail(message: string): void {
      instance.fail(message);
    },
    info(message: string): void {
      instance.info(message);
    },
    warn(message: string): void {
      instance.warn(message);
    },
    stop(): void {
      instance.stop();
    },
  };
}

export async function createLoggerAsync(): Promise<Logger> {
  const ora = await import('ora');

  return factory(ora.default());
}
