export * from "./compute.config.js"
export * from "./deployment.config.js"
export * from "./firewall.config.js"
export * from "./pipeline.config.js"
export * from "./repository.config.js"


import computeConfig from "./compute.config.js"
import deploymentConfig from "./deployment.config.js"
import firewallConfig from "./firewall.config.js"
import pipelineConfig from "./pipeline.config.js"
import repositoryConfig from "./repository.config.js"

const devConfig = {
    compute: computeConfig,
    deployment: deploymentConfig,
    firewall: firewallConfig,
    pipeline: pipelineConfig,
    repository: repositoryConfig,
} as const;

export default devConfig
