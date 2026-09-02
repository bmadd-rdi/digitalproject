import { appEnv } from "./config/app-env";
import { createApp } from "./app";

const app = createApp({ startJobs: true });
const port = appEnv.PORT;

console.log(`Backend is running on http://localhost:${port}`);
console.log(`Swagger UI is at http://localhost:${port}/docs/`);

export { createApp } from "./app";

export default {
  port,
  hostname: "0.0.0.0",
  fetch: app.fetch,
};
