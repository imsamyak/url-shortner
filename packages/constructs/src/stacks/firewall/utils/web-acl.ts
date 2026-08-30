import { CfnOutput } from "aws-cdk-lib";
import { CfnWebACL, CfnWebACLAssociation } from "aws-cdk-lib/aws-wafv2";
import type { Construct } from "constructs";

import type { FirewallStackConfig } from "../config.js";

export function buildFirewalls(
  scope: Construct,
  namespace: string,
  config: FirewallStackConfig,
): Readonly<Record<string, CfnWebACL>> {
  const firewalls: Record<string, CfnWebACL> = {};

  config.forEach(({ id, webAcl: props, associations = [] }) => {
    if (firewalls[id]) {
      throw new Error(`Duplicate WAF id: ${id}`);
    }

    const webAcl = new CfnWebACL(scope, `waf-${id}`, props);

    associations.forEach((association, index) => {
      new CfnWebACLAssociation(scope, `waf-${id}-association-${index + 1}`, {
        ...association,
        webAclArn: webAcl.attrArn,
      });
    });

    new CfnOutput(scope, `${id}-waf-arn`, {
      value: webAcl.attrArn,
      exportName: `${namespace}-${id}-waf-arn`,
    });

    firewalls[id] = webAcl;
  });

  return firewalls;
}
