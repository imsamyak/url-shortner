import type { StackProps } from "aws-cdk-lib";

/** Service-owned identity used to derive stable stack and resource names. */
export interface StackContext {
  readonly realm: string;
  readonly name: string;
  readonly env: string;
}

/** Constructor shape shared by the reusable stack implementations. */
export type StackOptions<TConfig extends object> = StackProps & {
  readonly namespace: string;
  readonly config: TConfig;
};

export function buildStackNamespace(context: StackContext): string {
  return `${context.realm}-${context.name}-${context.env}`;
}
