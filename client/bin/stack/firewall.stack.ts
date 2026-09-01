import { Stack, type StackProps } from "aws-cdk-lib";
import type { Construct } from "constructs";

import { buildWaf, type WafConfig } from "@app/infra-core/constructs.js";

import { StackContext } from "@app/infra-core/utils.js";
import loadConfig from "../config/index.js";

export interface FirewallStackProps extends StackProps {
  readonly namespace: string;
  readonly config: Omit<WafConfig, "namespace">;
}

/** Owns WAF protection and viewer-IP rate limiting for Nuxt. */
export class FirewallStack extends Stack {
  public static build(
    scope: Construct,
    ctx: StackContext,
  ): FirewallStack {
    const config = loadConfig(ctx.env, "firewall", ctx.namespace);
    return new FirewallStack(scope, ctx.id, {
      namespace: ctx.namespace,
      config,
    });
  }

  private constructor(
    scope: Construct,
    id: string,
    props: FirewallStackProps,
  ) {
    const { namespace, config, ...stackProps } = props;

    super(scope, id, {
      ...stackProps,
      stackName: namespace,
      description: "WAF protection and rate limiting for Nuxt",
    });

    buildWaf(this, "client", {
      namespace,
      ...config,
    });
  }
}
