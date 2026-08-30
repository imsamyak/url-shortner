import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

export async function hashPassword(
  password: string,
  logger: Logger,
): Promise<string> {
  try {
    return await bcrypt.hash(password, SALT_ROUNDS);
  } catch (err) {
    logger.error({ err }, "Failed to hash password");
    throw err;
  }
}

export async function validatePassword(
  password: string,
  hash: string,
  logger: Logger,
): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch (err) {
    logger.error({ err }, "Failed to validate password");
    throw err;
  }
}
