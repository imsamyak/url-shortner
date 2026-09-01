import isEmail from "validator/lib/isEmail.js";
import { ValidationError } from "@app/error";

export function validateEmail(email: string) {
  if (typeof email !== "string" || !isEmail(email)) {
    throw new ValidationError({
      resource: "Validation",
      issue: "Invalid email format"
    });
  }
}

export function validatePasswordStrength(password: string) {
  if (typeof password !== "string" || password.length < 6) {
    throw new ValidationError({
      resource: "Validation",
      issue: "Password must be at least 6 characters long."
    });
  }
}
