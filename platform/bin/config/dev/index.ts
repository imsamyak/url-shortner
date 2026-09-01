export * from "./network.config.js";
export * from "./data.config.js";
export * from "./observability.config.js";

import networkConfig from "./network.config.js";
import dataConfig from "./data.config.js";
import observabilityConfig from "./observability.config.js";

const configs = {
    network: networkConfig,
    data: dataConfig,
    observability: observabilityConfig
} as const;

export default configs;
