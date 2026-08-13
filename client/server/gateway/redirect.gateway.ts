import ApiClient from "./core/client";

import type { ApiResponse } from "./core/client";
import type { Redirect } from "./core/type";

export default class RedirectGateway {
  private readonly client: ApiClient;

  constructor(auth?: string) {
    this.client = new ApiClient("/redirect", auth);
  }

  async create(params: {
    origin: string;
    expiresAt?: string;
  }): Promise<ApiResponse<{ redirect: Redirect }>> {
    return this.client.post<ApiResponse<{ redirect: Redirect }>>({
      url: "/",
      secured: true,
      data: params,
    });
  }

  async get(shortId: string): Promise<ApiResponse<{ url: Redirect }>> {
    return this.client.get<ApiResponse<{ url: Redirect }>>({
      url: `/${shortId}`,
      secured: true,
    });
  }

  async delete(shortId: string): Promise<ApiResponse> {
    return this.client.delete<ApiResponse>({
      url: `/${shortId}`,
      secured: true,
    });
  }
}
