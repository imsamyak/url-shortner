export abstract class DomainException extends Error {
  constructor(message: string, cause?: unknown) {
    super(message, { cause });
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ConfigurationException extends DomainException {
  constructor(message: string = "Configuration error", cause?: unknown) {
    super(message, cause);
  }
}

export class ResourceNotFoundException extends DomainException {
  constructor(resource: string = "Resource", cause?: unknown) {
    super(`${resource} not found`, cause);
  }
}

export class ResourceAlreadyExistsException extends DomainException {
  constructor(resource: string = "Resource", cause?: unknown) {
    super(`${resource} already exists`, cause);
  }
}

export class ValidationException extends DomainException {
  constructor(message: string = "Validation failed", cause?: unknown) {
    super(message, cause);
  }
}

export class UnauthenticatedException extends DomainException {
  constructor(message: string = "Unauthenticated access", cause?: unknown) {
    super(message, cause);
  }
}

export class ForbiddenException extends DomainException {
  constructor(message: string = "Access forbidden", cause?: unknown) {
    super(message, cause);
  }
}

export class BadRequestException extends DomainException {
  constructor(message: string = "Bad request", cause?: unknown) {
    super(message, cause);
  }
}
