import { isEmail } from "validator";
import { ValidationException } from "../../domain/exception";

export function validateEmail(email: string) {
  if (typeof email !== "string" || !isEmail(email)) {
    throw new ValidationException("Invalid email format");
  }
}

export function validatePasswordStrength(password: string) {
  if (typeof password !== "string" || password.length < 6) {
    throw new ValidationException(
      "Password must be at least 6 characters long.",
    );
  }
}
