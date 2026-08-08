import {
  ResourceNotFoundException,
  ResourceAlreadyExistsException,
  ValidationException,
  BadRequestException,
  UnauthenticatedException,
  ForbiddenException,
  DomainException,
} from "../../../domain/exception";

export class HttpError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(
    statusCode: number,
    message: string,
    code: string = "INTERNAL_SERVER_ERROR",
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  static from(err: unknown): HttpError {
    if (err instanceof HttpError) return err;

    if (err instanceof DomainException) {
      if (err instanceof ResourceNotFoundException)
        return new NotFoundError(err.message);
      if (err instanceof ResourceAlreadyExistsException)
        return new ConflictError(err.message);
      if (
        err instanceof ValidationException ||
        err instanceof BadRequestException
      )
        return new BadRequestError(err.message);
      if (err instanceof UnauthenticatedException)
        return new UnauthorizedError(err.message);
      if (err instanceof ForbiddenException)
        return new ForbiddenError(err.message);

      return new InternalServerError(err.message);
    }

    if (err instanceof Error) {
      return new InternalServerError(err.message);
    }

    return new InternalServerError("Something went wrong!");
  }
}

export class BadRequestError extends HttpError {
  constructor(message: string = "Bad Request") {
    super(400, message, "BAD_REQUEST");
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message: string = "Unauthorized") {
    super(401, message, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends HttpError {
  constructor(message: string = "Forbidden") {
    super(403, message, "FORBIDDEN");
  }
}

export class NotFoundError extends HttpError {
  constructor(message: string = "Not Found") {
    super(404, message, "NOT_FOUND");
  }
}

export class ConflictError extends HttpError {
  constructor(message: string = "Conflict") {
    super(409, message, "CONFLICT");
  }
}

export class InternalServerError extends HttpError {
  constructor(message: string = "Internal Server Error") {
    super(500, message, "INTERNAL_SERVER_ERROR");
  }
}
