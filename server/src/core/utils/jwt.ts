import jwt, { SignOptions } from "jsonwebtoken";
import { ConfigurationException } from "../../domain/exception";

const getSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new ConfigurationException("JWT_SECRET not found in environment");
  }
  return secret;
};

export function encodeJWT(payload: string, logger: Logger): string | null {
  const options: SignOptions = { expiresIn: "7d" };
  try {
    const token = jwt.sign({ id: payload }, getSecret(), options);
    return token;
  } catch (err) {
    logger.error({ err }, "Failed to encode JWT");
    return null;
  }
}

export function decodeJWT(token: string, logger: Logger): string | null {
  try {
    const decoded = jwt.verify(token, getSecret()) as { id: string };
    return decoded?.id;
  } catch (err) {
    logger.error({ err }, "Failed to decode JWT");
    return null;
  }
}
