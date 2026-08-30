import app from "./app";

async function run() {
  await app();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
