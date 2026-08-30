import type {
  CfnWebACLAssociationProps,
  CfnWebACLProps,
} from "aws-cdk-lib/aws-wafv2";

export interface FirewallConfig {
  readonly id: string;
  readonly webAcl: CfnWebACLProps;
  readonly associations?: readonly Omit<
    CfnWebACLAssociationProps,
    "webAclArn"
  >[];
}

export type FirewallStackConfig = readonly FirewallConfig[];
