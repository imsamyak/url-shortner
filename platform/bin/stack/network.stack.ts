import { Stack, StackProps } from "aws-cdk-lib";
import type { Construct } from "constructs";
import loadConfig from "../config/index.js";


import { buildVpc } from "@app/infra-core/constructs.js";
import NetworkStackConfig from "../types/network-config.js";
import { StackContext } from "@app/infra-core/utils.js";

export interface NetworkStackProps extends StackProps {
  readonly namespace: string;
  readonly config: NetworkStackConfig;
}

/** Owns the regional VPC shared by the client and backend services. */
export class NetworkStack extends Stack {

  public static build(scope: Construct, ctx: StackContext, props?: StackProps) {
    const config = loadConfig(ctx.env, "network", ctx.namespace);

    return new NetworkStack(scope, ctx.id, {
      ...props,
      namespace: ctx.namespace,
      config,
    });
  }

  private constructor(
    scope: Construct,
    id: string,
    props: NetworkStackProps,
  ) {
    const { namespace, config, ...stackProps } = props;

    super(scope, id, {
      ...stackProps,
      stackName: namespace,
      description: "Shared core infrastructure for client and backend services",
    });

    buildVpc(this, "vpc", {
      namespace: namespace,
      props: config.vpc
    });
  }
}

export default NetworkStack;


