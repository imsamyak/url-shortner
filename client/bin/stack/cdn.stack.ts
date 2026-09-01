import { Stack, type StackProps } from "aws-cdk-lib";
import type { Construct } from "constructs";

import { buildCdn, type CdnConfig } from "@app/infra-core/constructs.js";

import { StackContext } from "@app/infra-core/utils.js";
import loadConfig from "../config/index.js";

export interface CdnStackProps extends StackProps {
  readonly namespace: string;
  readonly config: Omit<CdnConfig, "namespace">;
}

/** Owns the public CloudFront distribution for the Nuxt application. */
export class CdnStack extends Stack {
  public static build(
    scope: Construct,
    ctx: StackContext,
  ): CdnStack {
    const config = loadConfig(ctx.env, "cdn", ctx.namespace);
    return new CdnStack(scope, ctx.id, {
      namespace: ctx.namespace,
      config,
    });
  }

  private constructor(
    scope: Construct,
    id: string,
    props: CdnStackProps,
  ) {
    const { namespace, config, ...stackProps } = props;

    super(scope, id, {
      ...stackProps,
      stackName: namespace,
      description: "CloudFront delivery for the public Nuxt application",
    });

    buildCdn(this, "client", {
      namespace,
      ...config,
    });
  }
}
