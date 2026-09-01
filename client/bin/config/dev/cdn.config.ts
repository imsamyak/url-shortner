import type { CdnConfig } from "@app/infra-core/constructs.js";
import { Duration, Fn } from "aws-cdk-lib";
import {
  AllowedMethods,
  CachePolicy,
  HttpVersion,
  OriginProtocolPolicy,
  OriginRequestPolicy,
  PriceClass,
  ResponseHeadersPolicy,
  ViewerProtocolPolicy,
} from "aws-cdk-lib/aws-cloudfront";
import { HttpOrigin } from "aws-cdk-lib/aws-cloudfront-origins";

import { getDeploymentConfig } from "./deployment.config.js";

/** Builds the CloudFront configuration backed by the public Nuxt ALB. */
export function getCdnConfig(namespace: string): Omit<CdnConfig, "namespace"> {
  const deployment = getDeploymentConfig(namespace);
  const origin = new HttpOrigin(
    Fn.importValue(`${deployment.computeNamespace}-client-alb-dns`),
    {
      protocolPolicy: OriginProtocolPolicy.HTTP_ONLY,
      readTimeout: Duration.seconds(60),
    },
  );

  return {
    props: {
      comment: `${deployment.serviceNamespace} public distribution`,
      enabled: true,
      httpVersion: HttpVersion.HTTP2_AND_3,
      priceClass: PriceClass.PRICE_CLASS_100,
      defaultBehavior: {
        origin,
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: AllowedMethods.ALLOW_ALL,
        cachePolicy: CachePolicy.CACHING_DISABLED,
        originRequestPolicy: OriginRequestPolicy.ALL_VIEWER,
        responseHeadersPolicy: ResponseHeadersPolicy.SECURITY_HEADERS,
        compress: true,
      },
      additionalBehaviors: {
        "/_nuxt/*": {
          origin,
          viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          allowedMethods: AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
          cachePolicy: CachePolicy.CACHING_OPTIMIZED,
          responseHeadersPolicy: ResponseHeadersPolicy.SECURITY_HEADERS,
          compress: true,
        },
      },
    },
  };
}

export default getCdnConfig;
