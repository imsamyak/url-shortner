import type { WafConfig } from "@app/infra-core/constructs.js";
import { Fn } from "aws-cdk-lib";

import { getDeploymentConfig } from "./deployment.config.js";

/** Builds the regional WAF policy for the internal Express load balancer. */
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
          name: "ip-rate-limit",
          priority: 0,
          action: { block: {} },
          statement: {
            rateBasedStatement: {
              aggregateKeyType: "IP",
              limit: deployment.rateLimitPerFiveMinutes,
            },
          },
          visibilityConfig: {
            cloudWatchMetricsEnabled: true,
            metricName: `${namespace}-ip-rate-limit`,
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
        `${deployment.computeNamespace}-server-alb-arn`,
      ),
    },
  };
}

export default getFirewallConfig;
