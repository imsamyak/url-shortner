import db from "../../infra/database";
import { ResourceNotFoundException } from "../../domain/exception";
import { UserRepository } from "../../infra/database/repository/user.repository";
import { RequestContext } from "../../domain/type";
import { User } from "../../domain/entity/user.entity";

export default class UserService {
  private readonly repo: UserRepository;

  constructor(
    private readonly context: RequestContext,
    private readonly logger: Logger,
  ) {
    this.repo = new db.repositories.User(logger);
  }

  async updateProfile(params: Partial<Pick<User, "name">>) {
    const { name } = params;
    try {
      await this.repo.update(this.context.userId, { name });
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }

  async getProfile() {
    const userId = this.context.userId;

    try {
      const user = await this.repo.getById(userId);

      if (!user) {
        throw new ResourceNotFoundException(`User: ${userId}`);
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
      };
    } catch (err) {
      this.logger.error(err);
      throw err;
    }
  }
}
