import userRepository from "../repository/user.repository";
import { ResourceNotFoundError } from "@app/error";
import { User } from "../../domain/entity/user.entity";

export class UserService {
  constructor(
    private readonly auth: AuthContext,
    private readonly logger: Logger,
  ) { }

  async updateProfile(params: Partial<Pick<User, "name">>) {
    const { name } = params;
    try {
      await userRepository.update(this.auth.userId, { name });
    } catch (err) {
      this.logger.error({ err });
      throw err;
    }
  }

  async getProfile() {
    const userId = this.auth.userId;

    try {
      const user = await userRepository.getById(userId);

      if (!user) {
        throw new ResourceNotFoundError({
          resource: "User",
          id: userId
        });
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
      };
    } catch (err) {
      this.logger.error({ err });
      throw err;
    }
  }
}


export default UserService;
