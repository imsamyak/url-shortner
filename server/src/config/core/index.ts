import { ConfigurationException } from "../../domain/exception";

let { ENV = "local", HOST, PORT, CLIENTS } = process.env;

if (ENV === "local") {
  HOST ??= "localhost";
  PORT ??= "4000";
  CLIENTS ??= "http://localhost:3000";
}

if (!HOST || !PORT || !CLIENTS) {
  throw new ConfigurationException("Missing required environment variables");
}

export default {
  env: ENV,
  host: HOST,
  port: Number(PORT),
  clients: CLIENTS.split(",").map((client) => client.trim()),
} as const;
