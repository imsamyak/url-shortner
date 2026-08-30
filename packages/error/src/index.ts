import { HttpError, HttpStatusMap } from "./types/http";
import { ServiceErrorCode } from "./types/core";

export abstract class ServiceError extends Error {

    protected constructor(
        message: string,
        options?: ErrorOptions,
    ) {
        super(message, options);
    }

    abstract readonly code: ServiceErrorCode;

    /**
     * User-facing message sent in HTTP responses.
     * `this.message` remains reserved for detailed internal logging.
     */
    abstract httpMessage(): string;

    public toHttpError(): HttpError {
        return {
            httpStatus: HttpStatusMap[this.code] ?? 500,
            code: this.code,
            message: this.httpMessage(),
        };
    }

    public override toString(): string {
        return JSON.stringify({
            message: `[${this.code}]: ${this.message}`,
            cause: this.cause instanceof Error
                ? this.cause.message
                : this.cause,
        });
    }

    public static from(err: unknown): ServiceError {

        if (err instanceof ServiceError) {
            return err;
        }

        if (err instanceof Error) {
            return new InternalError(err.message, err);
        }

        let message: string;
        if (typeof err === "string") {
            message = err;
        } else {
            try {
                message = JSON.stringify(err);
            } catch {
                message = "Unknown Internal error occurred.";
            }
        }

        return new InternalError(message, { cause: err });
    }
}

export class InternalError extends ServiceError {
    readonly code = "INTERNAL_ERROR";

    constructor(message: string, options?: ErrorOptions) {
        super(message, options);
    }

    httpMessage(): string {
        return "An internal error occurred.";
    }
}

export class ResourceNotFoundError extends ServiceError {
    readonly code = "RESOURCE_NOT_FOUND";

    constructor(
        readonly details: {
            readonly resource: string;
            readonly id?: string;
            readonly options?: ErrorOptions;
        },
    ) {
        const { resource, id, options } = details;
        super(`${resource} with id ${id} not found`, options);
    }

    httpMessage(): string {
        return this.details.id
            ? `${this.details.resource} with ID '${this.details.id}' was not found.`
            : `${this.details.resource} was not found.`;
    }
}

export class ResourceAlreadyExistsError extends ServiceError {
    readonly code = "RESOURCE_ALREADY_EXISTS";

    constructor(
        readonly details: {
            readonly resource: string;
            readonly id: string;
            readonly options?: ErrorOptions;
        },
    ) {
        const { resource, id, options } = details;
        super(`${resource} with id ${id} already exists`, options);
    }

    httpMessage(): string {
        return `${this.details.resource} with ID '${this.details.id}' already exists.`;
    }
}

export class UnauthorizedError extends ServiceError {
    readonly code = "UNAUTHORIZED";

    constructor(
        readonly details?: {
            readonly message?: string;
            readonly options?: ErrorOptions;
        },
    ) {
        const { message = "Unauthorized access", options } = details ?? {};
        super(`Unauthorized : ${message}`, options);
    }

    httpMessage(): string {
        return "Authentication is required to perform this action.";
    }
}

export class ForbiddenError extends ServiceError {
    readonly code = "FORBIDDEN_ERROR";

    constructor(
        readonly details?: {
            readonly message?: string;
            readonly options?: ErrorOptions;
        },
    ) {
        const { message = "Forbidden access", options } = details ?? {};
        super(`Forbidden : ${message}`, options);
    }

    httpMessage(): string {
        return "You do not have permission to access this resource.";
    }
}

export class ValidationError extends ServiceError {
    readonly code = "VALIDATION_ERROR";

    constructor(
        readonly details: {
            readonly resource: string;
            readonly issue: string;
            readonly options?: ErrorOptions;
        },
    ) {
        const { resource, issue, options } = details;
        super(`Invalid ${resource} : ${issue}`, options);
    }

    httpMessage(): string {
        return `Validation failed for ${this.details.resource}: ${this.details.issue}`;
    }
}

export class ConfigurationError extends ServiceError {
    readonly code = "CONFIGURATION_ERROR";

    constructor(
        readonly details: {
            readonly message: string;
            readonly options?: ErrorOptions;
        },
    ) {
        const { message, options } = details;
        super(message, options);
    }

    httpMessage(): string {
        return "An internal server configuration error occurred.";
    }
}
