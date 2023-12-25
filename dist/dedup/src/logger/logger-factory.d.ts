export interface Logger {
    start(message: string): Logger;
    next(message: string): void;
    succeed(message: string): void;
    fail(message: string): void;
    info(message: string): void;
    warn(message: string): void;
    stop(): void;
}
export declare function createLoggerAsync(): Promise<Logger>;
