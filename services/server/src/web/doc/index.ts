import swaggerUi from "swagger-ui-express";
import { Router } from "express";
import swaggerDocument from "./swagger/swagger.json" with { type: "json" };

const useSwagger = (logger: Logger) => {
  try {
    return swaggerUi.setup(swaggerDocument);
  } catch (err) {
    logger.error({ err }, "Failed to initialize swagger");
    throw err;
  }
};

export const useDoc = (logger: Logger) => {
  const router = Router();
  try {
    // Swagger UI
    const setup = useSwagger(logger);
    router.use("/swagger", swaggerUi.serve, setup);
  } catch (err) {
    logger.error({ err }, "Failed to initialize docs");
  }

  return router;
};
