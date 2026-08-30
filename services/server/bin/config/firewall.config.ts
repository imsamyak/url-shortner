import type { FirewallStackConfig } from "@app/constructs";

import { serverDeploymentConfig } from "./deployment.config.js";

/** Regional WAF policy associated with the internal Express load balancer. */
export function createFirewallConfig(
  loadBalancerArn: string,
): FirewallStackConfig {
  return [
    {
      id: "server",
      webAcl: {
        name: `${serverDeploymentConfig.namespace}-server`,
        scope: "REGIONAL",
        defaultAction: { allow: {} },
        visibilityConfig: {
          cloudWatchMetricsEnabled: true,
          metricName: `${serverDeploymentConfig.namespace}-server-waf`,
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
                limit: serverDeploymentConfig.rateLimitPerFiveMinutes,
              },
            },
            visibilityConfig: {
              cloudWatchMetricsEnabled: true,
              metricName: `${serverDeploymentConfig.namespace}-ip-rate-limit`,
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
              metricName: `${serverDeploymentConfig.namespace}-common-rules`,
              sampledRequestsEnabled: true,
            },
          },
        ],
      },
      associations: [{ resourceArn: loadBalancerArn }],
    },
  ];
}
