import ApiClient from "./core/client";

import type { ApiResponse } from "./core/client";
import type { User } from "./core/type";

export default class AuthGateway {
  private readonly client: ApiClient;

  constructor(private readonly auth?: string) {
    this.client = new ApiClient("/auth", auth);
  }

  async login(params: { email: string; password: string }): Promise<
    ApiResponse<{
      token: string;
      user: User;
    }>
  > {
    return this.client.post<
      ApiResponse<{
        token: string;
        user: User;
      }>
    >({ url: "/login", secured: false, data: params });
  }

  async register(params: {
    name: string;
    email: string;
    password: string;
  }): Promise<ApiResponse<{ user: User; token: string }>> {
    return this.client.post<ApiResponse<{ user: User; token: string }>>({
      url: "/register",
      secured: false,
      data: params,
    });
  }

  async logout(): Promise<void> {
    await this.client.post({ url: "/logout", secured: true });
  }

  async forgotPassword(params: { email: string }): Promise<ApiResponse> {
    return this.client.post<ApiResponse>({
      url: "/forgot-password",
      secured: false,
      data: params,
    });
  }

  async resetPassword(params: {
    token: string;
    newPassword: string;
  }): Promise<ApiResponse> {
    return this.client.post<ApiResponse>({
      url: "/reset-password",
      secured: false,
      data: params,
    });
  }
}
