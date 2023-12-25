export declare const enum OutputStream {
    HIDE = 0,
    PIPE = 1
}
export declare function execute(command: string, args: string[], outputStream?: OutputStream): Promise<string>;
