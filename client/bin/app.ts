#!/usr/bin/env node
import { App } from "aws-cdk-lib";
import { StackContext } from "@app/infra-core/utils.js";

import { CdnStack } from "./stack/cdn.stack.js";
import { ComputeStack } from "./stack/compute.stack.js";
import { FirewallStack } from "./stack/firewall.stack.js";
import { PipelineStack } from "./stack/pipeline.stack.js";
import { RepositoryStack } from "./stack/repository.stack.js";

const app = new App();
const env = process.env.APP_ENV ?? "dev";
const base = StackContext.builder(env, "urlshortner", "client");

const repositoryStack = RepositoryStack.build(app, base.stack("repository"));
const computeStack = ComputeStack.build(app, base.stack("compute"));
const firewallStack = FirewallStack.build(app, base.stack("firewall"));
const cdnStack = CdnStack.build(app, base.stack("cdn"));
const pipelineStack = PipelineStack.build(app, base.stack("pipeline"));

computeStack.addStackDependency(repositoryStack);
firewallStack.addStackDependency(computeStack);
cdnStack.addStackDependency(computeStack);
pipelineStack.addStackDependency(repositoryStack);
pipelineStack.addStackDependency(computeStack);
pipelineStack.addStackDependency(cdnStack);

app.synth();
