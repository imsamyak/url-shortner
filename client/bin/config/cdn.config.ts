import type { CdnStackConfig } from "@app/constructs";
import { Duration } from "aws-cdk-lib";
import {
  AllowedMethods,
  CachePolicy,
  OriginProtocolPolicy,
  OriginRequestPolicy,
  ViewerProtocolPolicy,
} from "aws-cdk-lib/aws-cloudfront";
import { LoadBalancerV2Origin } from "aws-cdk-lib/aws-cloudfront-origins";
import type { ApplicationLoadBalancer } from "aws-cdk-lib/aws-elasticloadbalancingv2";

export function createCdnConfig(
  loadBalancer: ApplicationLoadBalancer,
): CdnStackConfig {
  const origin = new LoadBalancerV2Origin(loadBalancer, {
    protocolPolicy: OriginProtocolPolicy.HTTP_ONLY,
    readTimeout: Duration.seconds(60),
  });

  return [
    {
      id: "client",
      distribution: {
        defaultBehavior: {
          origin,
          viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          allowedMethods: AllowedMethods.ALLOW_ALL,
          cachePolicy: CachePolicy.CACHING_DISABLED,
          originRequestPolicy: OriginRequestPolicy.ALL_VIEWER,
        },
        additionalBehaviors: {
          "/_nuxt/*": {
            origin,
            viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            allowedMethods: AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
            cachePolicy: CachePolicy.CACHING_OPTIMIZED,
          },
        },
      },
    },
  ];
}
