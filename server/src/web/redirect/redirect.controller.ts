import { Request, Response } from "express";
import RedirctService from "../../core/service/redirct.service";

// GET: /:shortId
export const redirectRedirect = async (req: Request, res: Response) => {
  const logger = req.log;

  try {
    logger.debug("RedirectRedirect: START");
    const { shortId } = req.params;

    const urlService = new RedirctService(req.context, logger);
    const record = await urlService.getRedirect(shortId as string);

    logger.debug("RedirectRedirect: SUCCESS");
    return res.redirect(302, record.origin);
  } catch (err) {
    logger.error(err, "RedirectRedirect: FAILED");
    throw err;
  }
};
