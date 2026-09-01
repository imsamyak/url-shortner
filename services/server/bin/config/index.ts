import { buildConfigLoader } from "@app/infra-core/utils.js";

import devConfig from "./dev";
import prodConfig from "./prod";

const configs = {
  dev: devConfig,
  prod: prodConfig,
} as const;

export const loadConfig = buildConfigLoader(configs);

export default loadConfig;
