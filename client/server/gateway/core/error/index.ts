import { AxiosError } from "axios";

interface ApiGatewayErrorOption<T = any> {
  cause: T;
  default?: {
    status?: number;
    message?: string;
  };
}

export default class ApiGatewayError extends Error {
  status: number;
  cause: any;

  private constructor(option: {
    status?: number;
    message?: string;
    cause: any;
  }) {
    const message = option.message ?? "API Internal Error";
    const status = option.status ?? 500;

    super(message);
    this.status = status;
    this.cause = option.cause;
  }

  private static fromAxiosError(
    option: ApiGatewayErrorOption<AxiosError>,
  ): ApiGatewayError {
    const { cause, default: fallback } = option;
    const data = cause.response?.data as any;

    const status = cause.response?.status ?? cause.status ?? fallback?.status;
    const message =
      data?.error?.message ??
      data?.message ??
      cause.message ??
      fallback?.message;

    return new ApiGatewayError({ status, message, cause });
  }

  static from(option: ApiGatewayErrorOption): ApiGatewayError {
    if (option.cause instanceof ApiGatewayError) {
      return option.cause;
    }

    // Check if it is an AxiosError
    if (option.cause instanceof AxiosError) {
      return ApiGatewayError.fromAxiosError(option);
    }

    // Extract status code and message from option
    let status = option?.default?.status;
    let message = option?.default?.message;

    if (option.cause && typeof option.cause === "object") {
      const source = option.cause as any;

      // Extract numeric status code if present (e.g. from standard Error or custom response)
      if (source.status && typeof source.status === "number") {
        status = source.status;
      }

      // Safeguard and extract a string error message if available
      if (source.message && typeof source.message === "string") {
        message = source.message;
      }
    }

    return new ApiGatewayError({
      status,
      message,
      cause: option.cause,
    });
  }
}
