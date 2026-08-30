import pino, { type Logger } from "pino";

const defaultRedactPaths = [
  "password",
  "passwordHash",
  "token",
  "accessToken",
  "refreshToken",
  "authorization",
  "secretAccessKey",
  "email",
  "firstName",
  "lastName",
  "fullName",
  "phone",
  "phoneNumber",
  "*.email",
  "*.firstName",
  "*.lastName",
  "user.email",
  "user.name",
  "body.email",
  "body.name",
] as const;

export interface LoggerConfig {
  /** The name of the logger, typically the service or component name */
  readonly name: string;
  /** The minimum log level to output */
  readonly level: pino.LevelWithSilent | (string & {});
  /** Enable pretty-printing for local development */
  readonly pretty?: boolean;
  /** Enable automatic redaction of sensitive fields (defaults to true if omitted) */
  readonly redact?: boolean;
  /** Additional custom paths to redact (e.g., "req.headers.authorization") */
  readonly customRedactPaths?: string[];
  /** Custom serializers for specific log properties */
  readonly serializers?: Record<string, (value: any) => any>;
  /** Base object to include in every log message (set to null to omit standard fields) */
  readonly base?: Record<string, any> | null;
}



export function buildLogger(config: LoggerConfig): Logger {
  const redactPaths = config.redact === false 
    ? [] 
    : [...defaultRedactPaths, ...(config.customRedactPaths ?? [])];

  return pino({
    name: config.name,
    level: config.level,
    base: config.base,
    redact: redactPaths.length > 0 ? {
      paths: redactPaths,
      censor: "[REDACTED]",
    } : undefined,
    serializers: {
      err: pino.stdSerializers.err,
      error: pino.stdSerializers.err,
      ...config.serializers,
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    ...(config.pretty && {
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
          ignore: "pid,hostname",
        },
      },
    }),
  });
}


export default buildLogger;
