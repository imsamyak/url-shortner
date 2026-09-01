import type { Stack } from "aws-cdk-lib";
import {
  CfnWebACL,
  CfnWebACLAssociation,
  type CfnWebACLAssociationProps,
  type CfnWebACLProps,
} from "aws-cdk-lib/aws-wafv2";

export interface WafConfig {
  readonly namespace: string;
  readonly props: CfnWebACLProps;
  readonly association?: Omit<CfnWebACLAssociationProps, "webAclArn">;
}

/** Builds one WAF web ACL and optionally associates it with a regional resource. */
export function buildWaf(
  stack: Stack,
  id: string,
  config: WafConfig,
): CfnWebACL {
  const { props, association } = config;
  const webAcl = new CfnWebACL(stack, id, props);

  if (association) {
    new CfnWebACLAssociation(stack, `${id}-association`, {
      ...association,
      webAclArn: webAcl.attrArn,
    });
  }

  return webAcl;
}
