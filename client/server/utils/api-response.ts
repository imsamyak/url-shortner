export type APISuccess<T = any> = {
  message: string;
  data?: T;
};

export type APIFailure = {
  message: string;
  error: unknown;
};
