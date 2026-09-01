import { buildConfigLoader } from "@app/infra-core/utils.js";

import devConfig from "./dev/index.js";
import prodConfig from "./prod/index.js";

const configs = {
  dev: devConfig,
  prod: prodConfig,
} as const;

export const loadConfig = buildConfigLoader(configs);

export default loadConfig;
