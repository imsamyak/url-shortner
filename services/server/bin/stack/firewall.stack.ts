import { Stack, type StackProps } from "aws-cdk-lib";
import type { Construct } from "constructs";

import { buildWaf } from "@app/infra-core/constructs.js";

import { StackContext } from "@app/infra-core/utils.js";
import loadConfig from "../config/index.js";
import type { WafConfig } from "@app/infra-core/constructs.js";

export interface FirewallStackProps extends StackProps {
  readonly namespace: string;
  readonly config: Omit<WafConfig, "namespace">;
}

/** 
 * Owns Express WAF managed rules and request-rate limiting.
 * This acts as the security layer directly protecting the Compute stack.
 */
export class FirewallStack extends Stack {
  
  /**
   * Static factory method to build the Firewall Stack.
   * Encapsulates configuration loading.
   */
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
      description: "WAF protection and rate limiting for Express",
    });

    // Build the AWS WAF Web ACL and automatically attach it 
    // to the Application Load Balancer ARN provided in the config.
    buildWaf(this, "server", {
      namespace,
      ...config,
    });
  }
}
