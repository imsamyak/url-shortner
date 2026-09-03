export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Redirect {
  id: string;
  url: string;
  origin: string;
  createdAt: string;
  expiresAt?: string;
}

export type ArchitectureDetailId =
  | "cloudfront"
  | "alb"
  | "vpc"
  | "waf"
  | "nuxt"
  | "internal-alb"
  | "express"
  | "ddb-endpoint"
  | "dynamodb"
  | "pipeline"
  | "ecr"
  | "codedeploy"
  | "secrets-manager"
  | "iam"
  | "cloudwatch"
  | "sns";
