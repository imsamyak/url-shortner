import type { Server } from "node:http";
import {
  BadRequestException,
  ForbiddenException,
  ResourceAlreadyExistsException,
} from "../../../src/domain/exception";
import type { Redirect } from "../../../src/domain/entity/redirect.entity";
import type { User } from "../../../src/domain/entity/user.entity";
import db, {
  type RepositoryConstructors,
} from "../../../src/infra/db";
import type { RedirectRepository } from "../../../src/infra/db/repository/redirect.repository";
import type { UserRepository } from "../../../src/infra/db/repository/user.repository";

const users = new Map<string, User>();
const userIdsByEmail = new Map<string, string>();
const redirects = new Map<string, Redirect & { author: string }>();

class InMemoryUserRepository implements UserRepository {
  constructor(_logger: Logger) { }

  async create(user: User): Promise<User> {
    if (userIdsByEmail.has(user.email)) {
      throw new ResourceAlreadyExistsException(
        "User with this email already exists",
      );
    }

    users.set(user.id, { ...user });
    userIdsByEmail.set(user.email, user.id);
    return { ...user };
  }

  async update(
    id: string,
    updates: Partial<Omit<User, "email" | "id">>,
  ): Promise<User> {
    const user = users.get(id);
    if (!user) {
      throw new BadRequestException("User not found");
    }

    const updated = { ...user, ...updates };
    users.set(id, updated);
    return { ...updated };
  }

  async getById(id: string): Promise<User | null> {
    const user = users.get(id);
    return user ? { ...user } : null;
  }

  async getByEmail(email: string): Promise<User | null> {
    const id = userIdsByEmail.get(email);
    return id ? this.getById(id) : null;
  }
}

class InMemoryRedirectRepository implements RedirectRepository {
  constructor(_logger: Logger) { }

  async put(
    redirect: Omit<Redirect, "createdAt">,
    author: string,
  ): Promise<Redirect> {
    if (redirects.has(redirect.id)) {
      throw new ResourceAlreadyExistsException(`URL: ${redirect.id}`);
    }

    const stored = {
      ...redirect,
      author,
      createdAt: new Date().toISOString(),
    };
    redirects.set(redirect.id, stored);
    return { ...redirect, createdAt: stored.createdAt };
  }

  async get(id: string): Promise<Redirect | null> {
    const redirect = redirects.get(id);
    if (!redirect) {
      return null;
    }

    const { author: _author, ...publicRedirect } = redirect;
    return publicRedirect;
  }

  async getByAuthor(
    author: string,
    options?: { cursor?: string; limit?: number; sort?: "asc" | "desc" },
  ): Promise<{ items: Redirect[]; cursor?: string }> {
    const items = [...redirects.values()]
      .filter((redirect) => redirect.author === author)
      .sort((left, right) => left.createdAt.localeCompare(right.createdAt));

    if (options?.sort === "desc") {
      items.reverse();
    }

    return {
      items: items.slice(0, options?.limit),
    };
  }

  async delete(id: string, author: string): Promise<void> {
    const redirect = redirects.get(id);
    if (redirect && redirect.author !== author) {
      throw new ForbiddenException(
        "You are not authorized to delete this redirect",
      );
    }

    redirects.delete(id);
  }
}

await db.init({
  repositories: {
    User: InMemoryUserRepository,
    Redirect: InMemoryRedirectRepository,
  } as unknown as RepositoryConstructors,
});

const { createHttpApp } = await import("../../../src/app");
const { default: config } = await import("../../../src/config");
const server: Server = createHttpApp().listen(
  config.app.port,
  config.app.host,
  () => {
    console.log(
      `E2E server listening on http://${config.app.host}:${config.app.port}`,
    );
  },
);

function shutdown() {
  server.close((error) => {
    process.exit(error ? 1 : 0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
