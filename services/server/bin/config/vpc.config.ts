import {
  buildStackNamespace,
  type ComputeVpcImport,
  type StackContext,
} from "@app/constructs";
import { Fn } from "aws-cdk-lib";

import { serverStackContext } from "./stack.config.js";

const clientStackContext: StackContext = {
  realm: "global",
  name: "url-shortener-client",
  env: serverStackContext.env,
};
const clientNamespace = buildStackNamespace(clientStackContext);
const exportPrefix = `${clientNamespace}-application`;

/** VPC attributes exported by the Nuxt-owned network stack. */
export const clientVpcConfig: ComputeVpcImport = {
  id: "client-application",
  attributes: {
    vpcId: Fn.importValue(`${exportPrefix}-vpc-id`),
    vpcCidrBlock: Fn.importValue(`${exportPrefix}-vpc-cidr`),
    availabilityZones: [
      Fn.importValue(`${exportPrefix}-private-subnet-1-az`),
      Fn.importValue(`${exportPrefix}-private-subnet-2-az`),
    ],
    privateSubnetIds: [
      Fn.importValue(`${exportPrefix}-private-subnet-1-id`),
      Fn.importValue(`${exportPrefix}-private-subnet-2-id`),
    ],
    privateSubnetRouteTableIds: [
      Fn.importValue(`${exportPrefix}-private-subnet-1-route-table-id`),
      Fn.importValue(`${exportPrefix}-private-subnet-2-route-table-id`),
    ],
  },
};
