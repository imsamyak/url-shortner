import ApiClient from "./core/client";
import type { ApiResponse } from "./core/client";
import type { Redirect, User } from "./core/type";

export default class UserGateway {
  private readonly client: ApiClient;

  constructor(auth?: string) {
    this.client = new ApiClient("/user", auth);
  }

  async getProfile(): Promise<ApiResponse<{ user: User }>> {
    return this.client.get<ApiResponse<{ user: User }>>({
      url: "/",
      secured: true,
    });
  }

  async updateProfile(params: { name?: string }): Promise<ApiResponse> {
    return this.client.put<ApiResponse>({
      url: "/",
      secured: true,
      data: params,
    });
  }

  async getRedirects(options?: {
    cursor?: string;
    limit?: number;
  }): Promise<ApiResponse<{ items: Redirect[]; cursor?: string }>> {
    return this.client.get<ApiResponse<{ items: Redirect[]; cursor?: string }>>(
      {
        url: "/redirects",
        secured: true,
        config: { params: options },
      },
    );
  }
}
