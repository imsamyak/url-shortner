import { ConfigurationException } from "../../domain/exception";

const { LOG_LVL = "debug", ENV = "local" } = process.env;

const validLogLevels = [
  "fatal",
  "error",
  "warn",
  "info",
  "debug",
  "trace",
  "silent",
];

if (!validLogLevels.includes(LOG_LVL)) {
  throw new ConfigurationException(`Invalid LOG_LVL: ${LOG_LVL}`);
}

export default {
  lvl: LOG_LVL,
  redactKeys:
    ENV === "local"
      ? []
      : [
          // Auth & Secrets
          "password",
          "passwordHash",
          "token",
          "accessToken",
          "refreshToken",
          "authorization",
          "secretAccessKey",

          // User PII
          "email",
          "firstName",
          "lastName",
          "fullName",
          "phone",
          "phoneNumber",

          // Deeply nested paths
          "*.email",
          "*.firstName",
          "*.lastName",
          "user.email",
          "user.name",
          "body.email",
          "body.name",
        ],
} as const;
