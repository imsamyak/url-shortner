import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import ApiGatewayError from "./error";

interface ApiRequestOption {
  url: string;
  data?: any;
  secured: boolean;
  config?: AxiosRequestConfig;
}

export interface ApiResponse<T = any> {
  message: string;
  data: T;
}

export default class ApiClient {
  protected readonly client: AxiosInstance;

  constructor(
    prefix: string = "",
    protected readonly auth?: string,
  ) {
    const baseUrl = useRuntimeConfig().public.apiUrl;

    this.client = axios.create({
      baseURL: `${baseUrl}${prefix}`,
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        throw ApiGatewayError.from({
          cause: error,
          default: {
            message: "API Request failed",
          },
        });
      },
    );
  }

  private getAuthHeader() {
    return this.auth ? { Authorization: `Bearer ${this.auth}` } : {};
  }

  private async request<T>(
    method: "GET" | "POST" | "PUT" | "DELETE",
    option: ApiRequestOption,
  ): Promise<T> {
    const config: AxiosRequestConfig = {
      method,
      url: option.url,
      data: option.data,
      ...option.config,
    };

    if (option.secured === true && !this.auth) {
      throw ApiGatewayError.from({
        cause: {
          status: 401,
          message: "Authentication token is required for this request",
        },
      });
    }

    config.headers = {
      ...this.getAuthHeader(),
      ...config.headers,
    };

    const response = await this.client.request<T>(config);
    return response.data;
  }

  public async get<T>(option: ApiRequestOption): Promise<T> {
    return this.request<T>("GET", option);
  }

  public async post<T>(option: ApiRequestOption): Promise<T> {
    return this.request<T>("POST", option);
  }

  public async put<T>(option: ApiRequestOption): Promise<T> {
    return this.request<T>("PUT", option);
  }

  public async delete<T>(option: ApiRequestOption): Promise<T> {
    return this.request<T>("DELETE", option);
  }
}
