import {
  ResourceAlreadyExistsException,
  ResourceNotFoundException,
} from "../../domain/exception";
import db from "../../infra/database";
import crypto from "node:crypto";
import { RedirectRepository } from "../../infra/database/repository/redirect.repository";
import { RequestContext } from "../../domain/type";
import { Redirect } from "../../domain/entity/redirect.entity";

export default class RedirctService {
  private readonly repo: RedirectRepository;

  constructor(
    private readonly context: RequestContext,
    private readonly logger: Logger,
  ) {
    this.repo = new db.repositories.Redirect(logger);
  }

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
    const userId = this.context.userId;

    try {
      const shortId = await this.generateShortId();

      const res = await this.repo.put(
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
        err instanceof ResourceAlreadyExistsException &&
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
      const record = await this.repo.get(shortId);
      if (!record) {
        throw new ResourceNotFoundException(`URL: ${shortId}`);
      }
      return record;
    } catch (err) {
      this.logger.error(err, "Failed to get url for redirect");
      throw err;
    }
  }

  async getRedirectsByAuthor(options?: { cursor?: string; limit?: number }) {
    const userId = this.context.userId;

    try {
      const result = await this.repo.getByAuthor(userId, {
        cursor: options?.cursor,
        limit: options?.limit,
        sort: "desc",
      });

      return {
        items: result.items,
        cursor: result.cursor ?? null,
      };
    } catch (err) {
      this.logger.error(err, "Failed to get urls");
      throw err;
    }
  }

  async deleteUrl(params: { shortId: string }) {
    const { shortId } = params;
    const userId = this.context.userId;

    try {
      await this.repo.delete(shortId, userId);
    } catch (err) {
      this.logger.error(err, "Failed to delete url");
      throw err;
    }
  }
}
