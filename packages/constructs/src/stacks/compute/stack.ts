import { Stack } from "aws-cdk-lib";
import type { Construct } from "constructs";

import type { StackOptions } from "../../core/index.js";
import type { ComputeStackConfig } from "./config.js";
import {
  buildComputeServices,
  type ComputeServiceResources,
} from "./utils/index.js";

export class ComputeStack extends Stack {
  public readonly services: Readonly<Record<string, ComputeServiceResources>>;

  constructor(
    scope: Construct,
    id: string,
    options: StackOptions<ComputeStackConfig>,
  ) {
    const { namespace, config, ...stackProps } = options;

    super(scope, id, stackProps);

    this.services = buildComputeServices(this, namespace, config);
  }
}
