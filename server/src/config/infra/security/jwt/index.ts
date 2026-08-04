import { ConfigurationException } from "../../../../domain/exception";

const {
  JWT_SECRET,
  JWT_ACCESS_EXPIRES_IN = "15m",
  JWT_REFRESH_EXPIRES_IN = "7d",
  JWT_RESET_PASSWORD_EXPIRES_IN = "1h",
  JWT_EMAIL_VERIFICATION_EXPIRES_IN = "24h",
} = process.env;

if (!JWT_SECRET) {
  throw new ConfigurationException(
    "Missing required environment variable: JWT_SECRET",
  );
}

export default {
  secret: JWT_SECRET,
  expiresIn: {
    access: JWT_ACCESS_EXPIRES_IN,
    refresh: JWT_REFRESH_EXPIRES_IN,
    resetPassword: JWT_RESET_PASSWORD_EXPIRES_IN,
    emailVerification: JWT_EMAIL_VERIFICATION_EXPIRES_IN,
  },
} as const;
