import LoadEnv from "@app/utils/loadEnv";
import { z } from "zod";

const secret = LoadEnv.of("JWT_SECRET", z.string().min(32)).get();

const jwtConfig = {
  secret,
  expiresIn: {
    access: "15m",
    refresh: "7d",
    reset_credential: "1h",
    email_verification: "24h",
  },
} as const;

export default jwtConfig;
