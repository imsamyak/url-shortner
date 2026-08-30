declare global {
  interface Logger {
    warn(obj: object, message?: string, ...args: any[]): void;
    warn(message: string, ...args: any[]): void;
    error(obj: object, message?: string, ...args: any[]): void;
    error(message: string, ...args: any[]): void;
    info(obj: object, message?: string, ...args: any[]): void;
    info(message: string, ...args: any[]): void;
    debug(obj: object, message?: string, ...args: any[]): void;
    debug(message: string, ...args: any[]): void;
    trace(obj: object, message?: string, ...args: any[]): void;
    trace(message: string, ...args: any[]): void;
    child(bindings: Record<string, any>): Logger;
  }
}

export {};
