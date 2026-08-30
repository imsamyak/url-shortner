import { ServiceErrorCode } from "./core";

export interface HttpError {
    httpStatus: number;
    code: ServiceErrorCode;
    message: string;
}

export const HttpStatusMap: Record<ServiceErrorCode, number> = {
    INTERNAL_ERROR: 500,
    RESOURCE_NOT_FOUND: 404,
    RESOURCE_ALREADY_EXISTS: 409,
    UNAUTHORIZED: 401,
    FORBIDDEN_ERROR: 403,
    VALIDATION_ERROR: 400,
    CONFIGURATION_ERROR: 500,
};
