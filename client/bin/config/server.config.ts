import { buildStackNamespace, type StackContext } from "@app/constructs";
import { Fn } from "aws-cdk-lib";

import { clientStackContext } from "./stack.config.js";

const serverContext: StackContext = {
  realm: "global",
  name: "url-shortener-server",
  env: clientStackContext.env,
};
const serverNamespace = buildStackNamespace(serverContext);

/** Values exported by the private Express compute stack. */
export const serverInfrastructure = {
  baseUrl: Fn.join("", [
    "http://",
    Fn.importValue(`${serverNamespace}-server-alb-dns`),
    "/api/v1",
  ]),
  loadBalancerSecurityGroupId: Fn.importValue(
    `${serverNamespace}-server-alb-sg-1-id`,
  ),
} as const;
