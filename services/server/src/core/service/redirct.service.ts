import {
  ResourceAlreadyExistsError,
  ResourceNotFoundError,
} from "@app/error";
import crypto from "node:crypto";
import redirectRepository from "../repository/redirect.repository";
import { Redirect } from "../../domain/entity/redirect.entity";

export class RedirctService {
  constructor(
    private readonly auth: AuthProvider,
    private readonly logger: Logger,
  ) { }

  private async generateShortId(): Promise<string> {
    return crypto.randomBytes(4).toString("base64url").substring(0, 6);
  }

  private async createRedirectInternal(
    params: {
      origin: string;
      expiresAt?: string;
    },
    options: {
      retries: number;
    },
  ): Promise<Redirect> {
    const { origin, expiresAt } = params;
    const userId = this.auth().userId;

    try {
      const shortId = await this.generateShortId();

      const res = await redirectRepository.put(
        {
          id: shortId,
          origin,
          expiresAt,
        },
        userId,
      );

      return res;
    } catch (err) {
      if (
        err instanceof ResourceAlreadyExistsError &&
        options.retries > 0
      ) {
        return this.createRedirectInternal(params, {
          retries: options.retries - 1,
        });
      }
      throw err;
    }
  }

  async createRedirect(params: {
    origin: string;
    expiresAt?: string;
  }): Promise<Redirect> {
    const redirect = await this.createRedirectInternal(params, {
      retries: 5,
    });

    return redirect;
  }

  async getRedirect(shortId: string) {
    try {
      const record = await redirectRepository.get(shortId);
      if (!record) {
        throw new ResourceNotFoundError({
          resource: "URL",
          id: shortId
        });
      }
      return record;
    } catch (err) {
      this.logger.error({ err }, "Failed to get url for redirect");
      throw err;
    }
  }

  async getRedirectsByAuthor(options?: { cursor?: string; limit?: number }) {
    const userId = this.auth().userId;

    try {
      const result = await redirectRepository.getByAuthor(userId, {
        cursor: options?.cursor,
        limit: options?.limit,
        sort: "desc",
      });

      return {
        items: result.items,
        cursor: result.cursor ?? null,
      };
    } catch (err) {
      this.logger.error({ err }, "Failed to get urls");
      throw err;
    }
  }

  async deleteUrl(params: { shortId: string }) {
    const { shortId } = params;
    const userId = this.auth().userId;

    try {
      await redirectRepository.delete(shortId, userId);
    } catch (err) {
      this.logger.error({ err }, "Failed to delete url");
      throw err;
    }
  }
}


export default RedirctService;
