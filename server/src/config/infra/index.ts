import database from "./database";
import cloudwatch from "./cloudwatch";
import security from "./security";

export default {
  database,
  cloudwatch,
  security,
} as const;
