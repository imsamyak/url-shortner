import { Request, Response } from "express";
import RedirctService from "../../../core/service/redirct.service";

const getBaseUrl = (req: Request): string => {
  return `${req.protocol}://${req.get("host")}/r`;
};

// GET: /api/v1/:shortId
export const redirectRedirect = async (req: Request, res: Response) => {
  const logger = req.log;

  try {
    logger.debug("RedirectRedirect: START");
    const { shortId } = req.params;
    const redirectService = new RedirctService(req.context, logger);
    const record = await redirectService.getRedirect(shortId as string);

    logger.debug("RedirectRedirect: SUCCESS");
    return res.redirect(302, record.origin);
  } catch (err) {
    logger.error(err, "RedirectRedirect: FAILED");
    throw err;
  }
};

// POST: /api/v1/url
export const createRedirect = async (req: Request, res: Response) => {
  const logger = req.log;

  try {
    logger.debug("CreateRedirect: START");

    const { origin, expiresAt } = req.body as {
      origin: string;
      password?: string;
      expiresAt?: string;
    };

    const redirectService = new RedirctService(req.context, logger);
    const redirect = await redirectService.createRedirect({
      origin,
      expiresAt,
    });

    logger.debug("CreateRedirect: SUCCESS");
    return res.status(200).json({
      message: "Short URL created successfully",
      data: {
        redirect: {
          id: redirect.id,
          url: `${getBaseUrl(req)}/${redirect.id}`,
          origin: redirect.origin,
          createdAt: redirect.createdAt,
          expiresAt: redirect.expiresAt,
        },
      },
    });
  } catch (err) {
    logger.error(err, "CreateRedirect: FAILED");
    throw err;
  }
};

// DELETE: /api/v1/:shortId
export const deleteRedirect = async (req: Request, res: Response) => {
  const logger = req.log;

  try {
    logger.debug("DeleteRedirect: START");

    const { shortId } = req.params;

    const redirectService = new RedirctService(req.context, logger);
    await redirectService.deleteUrl({
      shortId: shortId as string,
    });

    logger.debug("DeleteRedirect: SUCCESS");
    return res.status(200).json({ message: "URL deleted successfully" });
  } catch (err) {
    logger.error(err, "DeleteRedirect: FAILED");
    throw err;
  }
};
