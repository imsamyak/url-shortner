import type { FirewallStackConfig } from "@app/constructs";

import { clientDeploymentConfig } from "./deployment.config.js";

export function createFirewallConfig(
  loadBalancerArn: string,
): FirewallStackConfig {
  return [
    {
      id: "client",
      webAcl: {
        name: `${clientDeploymentConfig.namespace}-client`,
        scope: "REGIONAL",
        defaultAction: { allow: {} },
        visibilityConfig: {
          cloudWatchMetricsEnabled: true,
          metricName: `${clientDeploymentConfig.namespace}-client-waf`,
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
                limit: clientDeploymentConfig.rateLimitPerFiveMinutes,
              },
            },
            visibilityConfig: {
              cloudWatchMetricsEnabled: true,
              metricName: `${clientDeploymentConfig.namespace}-ip-rate-limit`,
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
              metricName: `${clientDeploymentConfig.namespace}-common-rules`,
              sampledRequestsEnabled: true,
            },
          },
        ],
      },
      associations: [{ resourceArn: loadBalancerArn }],
    },
  ];
}
