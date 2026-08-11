import swaggerUi from "swagger-ui-express";
import fs from "node:fs";
import path from "node:path";
import yaml from "yaml";
import { Router } from "express";

const useSwagger = (logger: Logger) => {
  try {
    const doc = yaml.parse(
      fs.readFileSync(path.join(__dirname, "./swagger/swagger.yaml"), "utf8"),
    );

    return swaggerUi.setup(doc);
  } catch (err) {
    logger.error(err, "Failed to initialize swagger");
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
    logger.error(err, "Failed to initialize docs");
  }

  return router;
};
