import "dotenv/config";
import app from "./app";

async function bootstrap() {
  await app();
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
