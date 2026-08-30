import { Request, Response } from "express";
import UserService from "../../../core/service/user.service";
import RedirctService from "../../../core/service/redirct.service";

export class UserController {
  // GET: /api/v1/user/profile
  getUserProfile = async (req: Request, res: Response) => {
    const logger = req.log;

    try {
      logger.debug("GetUserProfile: START");
      const userService = new UserService(req.auth, logger);
      const profile = await userService.getProfile();
      logger.debug("GetUserProfile: SUCCESS");
      return res.status(200).json({
        message: "Profile fetched successfully",
        data: { user: profile },
      });
    } catch (err) {
      logger.error(err, "GetUserProfile: FAILED");
      throw err;
    }
  };

  // PUT: /api/v1/user/profile
  updateUserProfile = async (req: Request, res: Response) => {
    const logger = req.log;

    try {
      const { name } = req.body;
      logger.debug("UpdateUserProfile: START");
      const userService = new UserService(req.auth, logger);
      await userService.updateProfile({
        name,
      });
      logger.debug("UpdateUserProfile: SUCCESS");
      return res.status(200).json({ message: "Profile updated successfully" });
    } catch (err) {
      logger.error(err, "UpdateUserProfile: FAILED");
      throw err;
    }
  };

  // GET: /api/v1/user/urls
  getUserRedirects = async (req: Request, res: Response) => {
    const logger = req.log;

    try {
      logger.debug("GetUserUrls: START");

      const cursor = req.query.cursor as string | undefined;
      const limit = req.query.limit
        ? Number.parseInt(req.query.limit as string, 10)
        : undefined;

      const redirectService = new RedirctService(req.auth, logger);
      const redirects = await redirectService.getRedirectsByAuthor({
        cursor,
        limit,
        
      });
      logger.debug("GetUserRedirects: SUCCESS");
      return res.status(200).json({
        message: "Redirects fetched successfully",
        data: {
          items: redirects.items.map((r: any) => ({
            id: r.id,
            url: `${req.protocol}://${req.get("host")}/r/${r.id}`,
            origin: r.origin,
            createdAt: r.createdAt,
            expiresAt: r.expiresAt,
          })),
          cursor: redirects.cursor,
        },
      });
    } catch (err) {
      logger.error(err, "GetUserRedirects: FAILED");
      throw err;
    }
  };
}


export default UserController;
