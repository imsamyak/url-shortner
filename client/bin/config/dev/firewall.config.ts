import type { WafConfig } from "@app/infra-core/constructs.js";
import { Fn } from "aws-cdk-lib";

import { getDeploymentConfig } from "./deployment.config.js";

/** Builds WAF managed rules and viewer-IP rate limiting for Nuxt. */
export function getFirewallConfig(
  namespace: string,
): Omit<WafConfig, "namespace"> {
  const deployment = getDeploymentConfig(namespace);

  return {
    props: {
      name: namespace,
      scope: "REGIONAL",
      defaultAction: { allow: {} },
      visibilityConfig: {
        cloudWatchMetricsEnabled: true,
        metricName: `${namespace}-waf`,
        sampledRequestsEnabled: true,
      },
      rules: [
        {
          name: "viewer-ip-rate-limit",
          priority: 0,
          action: { block: {} },
          statement: {
            rateBasedStatement: {
              aggregateKeyType: "FORWARDED_IP",
              limit: deployment.rateLimitPerFiveMinutes,
              forwardedIpConfig: {
                headerName: "X-Forwarded-For",
                fallbackBehavior: "MATCH",
              },
            },
          },
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            metricName: `${namespace}-viewer-ip-rate-limit`,
            sampledRequestsEnabled: true,
          },
        },
        {
          name: "aws-common-rules",
          priority: 1,
          overrideAction: { none: {} },
          statement: {
            managedRuleGroupStatement: {
              vendorName: "AWS",
              name: "AWSManagedRulesCommonRuleSet",
            },
          },
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            metricName: `${namespace}-common-rules`,
            sampledRequestsEnabled: true,
          },
        },
      ],
    },
    association: {
      resourceArn: Fn.importValue(
        `${deployment.computeNamespace}-client-alb-arn`,
      ),
    },
  };
}

export default getFirewallConfig;
