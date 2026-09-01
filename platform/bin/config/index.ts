export * from "./dev/index.js";
export * from "./prod/index.js";

import { buildConfigLoader } from "@app/infra-core/utils.js";
import dev from "./dev/index.js";
import prod from "./prod/index.js";

const configs = {
    dev,
    prod,
} as const;

export const loadConfig = buildConfigLoader(configs);

export default loadConfig;
