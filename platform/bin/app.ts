import { App } from "aws-cdk-lib";
import { StackContext } from "@app/infra-core/utils.js";
import NetworkStack from "./stack/network.stack.js";
import { DataStack } from "./stack/data.stack.js";
import { ObservabilityStack } from "./stack/observability.stack.js";

const env = process.env.APP_ENV ?? 'dev';

const app = new App();

const base = StackContext.builder(env, "urlshortner");

NetworkStack.build(app, base.stack("network"));
DataStack.build(app, base.stack("data"));
ObservabilityStack.build(app, base.stack("observability"));

app.synth();
