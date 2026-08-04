import "dotenv/config";

import core from "./core";
import log from "./log";
import infra from "./infra";

const config = {
  core,
  log,
  infra,
} as const;

export type AppConfig = typeof config;
export default Object.freeze(config);
